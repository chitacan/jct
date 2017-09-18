const {basename} = require('path');
const {Observable, Subscriber} = require('rxjs');
const {gt} = require('semver');
const req$ = require('../req');
const {spinner, wrap} = require('../utils');
const Summary = require('../types/summary');

exports.run = ($) =>
  $
  .do(() => spinner.start())
  .map(() => {
    const match = /(\w+)-\d+$/g.exec(basename(process.cwd()));
    if (match === null) {
      throw new Error('cannot resolve project key');
    }
    return match[1];
  })
  .switchMap((key) => {
    return Observable.of({url: `api/latest/project/${key}/versions`})
      .let(req$)
      .map((res) => res.data);
  }, (key, versions) => ({key, versions}))
  .switchMap(({key, versions}) => {
    /* eslint max-len: 0 */
    return Observable.from(versions)
      .takeLast(5)
      .map(({name, description, startDate, releaseDate, released})=> {
        return {
          version: name,
          startDate,
          releaseDate,
          released,
          description,
          config: {
            url: `api/latest/search`,
            params: {
              jql: `project = LFW AND fixVersion = ${name}`,
              fields: 'summary,issuetype,fixVersions,priority,status,creator,assignee,resolution',
              maxResults: 1000,
            },
          },
        };
      })
      .mergeMap(({config}) => {
        return Observable.of(config).let(req$).map((res) => res.data);
      }, ({version, description, startDate, releaseDate, released}, d) => {
        return Object.assign({
          version, description, startDate, releaseDate, released,
        }, d);
      })
      .map((d) => new Summary(d))
      .toArray();
  }, ({key}, summaries) => {
    return {
      key,
      summaries: summaries.sort((a, b) => gt(a._version, b._version) ? 1 : -1),
    };
  })
  .do(() => spinner.stop(), () => spinner.stop());

exports.subscriber = Subscriber.create(({key, summaries}) => {
  const output = [
    `  versions in ${key}`,
    '',
    ...summaries.map((summary, i, arr) => `  ${summary.oneLiner(arr)}`),
  ];
  console.log(wrap(output));
}, (e) => {
  console.log(wrap(`  ${e.message.red}`));
});
