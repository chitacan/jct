const {Observable, Subscriber} = require('rxjs');
const req$ = require('../req');
const {spinner, wrap, resolveKey$, resolveVersion$} = require('../utils');
const Summary = require('../types/summary');

exports.run = ($) =>
  $
  .do(() => spinner.start())
  .mergeMap(({version, options}) => {
    return Observable.combineLatest(
      resolveVersion$(version, options),
      resolveKey$(options.key),
      (version, key) => ({version, key})
    );
  })
  .switchMap(({version, key}) => {
    return Observable.of({url: `api/latest/project/${key}/versions`})
      .let(req$)
      .map((res) => res.data)
      .map((versions) => versions.find((v) => v.name === version))
      .do((v) => {
        if (!v) {
          throw new Error(`cannot find version \'${version}\' in project \'${key}\'`);
        }
      });
  }, (d, {startDate, released, releaseDate}) => {
    return Object.assign({startDate, released, releaseDate}, d);
  })
  .switchMap(({version, key}) => {
    /* eslint max-len: 0 */
    return Observable.of({
        url: `api/latest/search`,
        params: {
          jql: `project=${key} AND fixVersion=${version}`,
          fields: 'summary,issuetype,fixVersions,priority,status,creator,assignee,resolution',
        },
      })
      .let(req$)
      .map((res) => res.data)
      .map(({issues}) => issues);
  }, (d, issues) => Object.assign({issues}, d))
  .map((props) => new Summary(props))
  .do(() => spinner.stop(), () => spinner.stop());

exports.subscriber = Subscriber.create((summary) => {
  console.log(wrap(summary.report()));
}, (e) => {
  console.log(wrap(`  ${e.message.red}`));
});
