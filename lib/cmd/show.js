const {Observable, Subscriber} = require('rxjs');
const {resolve} = require('url');
const req$ = require('../req');
const {ghURL$} = require('../git');
const {spinner, wrap, resolveIssueKey$} = require('../utils');
const {get$} = require('../conf');
const Issue = require('../types/issue');
const Summary = require('../types/summary');

exports.run = ($) => {
  const single$ = $
    .do(() => spinner.start())
    .mergeMap(({issue}) => resolveIssueKey$(issue))
    .catch(() => [])
    .map((issue) => ({method: 'get', url: `api/latest/issue/${issue}`}))
    .let(req$)
    .map((res) => res.data)
    .combineLatest(ghURL$(), get$, (res, ghURL, {url}) => {
      return new Issue(
        Object.assign(res, {ghURL, jiraURL: resolve(url, 'browse')})
      );
    })
    .map((issue) => [
      `  ${issue.title()}`,
      '',
      `  ${issue.summary()}`,
      '',
      `  ${issue.links()}`,
    ]);

  /* eslint max-len: 0*/
  const recently$ = $
    .do(() => spinner.start())
    .mergeMap(({issue}) => resolveIssueKey$(issue))
    .filter((d) => !d)
    .catch(() => [{
      method: 'get',
      url: 'api/latest/search',
      params: {
        jql: 'issuekey in issueHistory() ORDER BY lastViewed DESC',
        fields: 'summary,issuetype,fixVersions,priority,status,creator,assignee,resolution',
        maxResults: 5,
      },
    }])
    .let(req$)
    .map((res) => res.data.issues)
    .map((issues) => new Summary({issues}))
    .map((summary) => [
      '  recently viewed',
      '',
      ...summary.issues(),
    ]);

  return Observable.merge(single$, recently$)
    .do(() => spinner.stop(), () => spinner.stop());
};

exports.subscriber = Subscriber.create((output) => {
  console.log(wrap(output));
}, (e) => {
  console.log(wrap(`  ${e.message.red}`));
});
