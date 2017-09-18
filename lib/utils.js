const {EOL} = require('os');
const {basename} = require('path');
const {Observable} = require('rxjs');
const ora = require('ora');
const _ = require('lodash');
const {branch$, latestTag$} = require('./git');

const ISSUE_REGEX = /\d+-[A-Z]+(?!-?[a-zA-Z]{1,10})/g;

exports.spinner = ora('Loading...');

exports.multiByteLength = (str) => {
  return str.split('')
  .map((c) => escape(c).length > 4 ? 2 : 1)
  .reduce((result, v) => result + v, 0);
};

exports.multiByteSlice = (str, target) => {
  const result = str.split('')
  .map((c) => escape(c).length > 4 ? {b: 2, c} : {b: 1, c})
  .map(({b, c}, index, arr) => {
    const len = arr
    .slice(0, index)
    .reduce((result, v) => result + v.b, 0) + b;
    return {len, c};
  })
  .filter(({len}) => len < target);
  const sliced = result.map(({c}) => c).join('');
  const [last] = result.reverse();
  return sliced + new Array(target - last.len).join(' ');
};

exports.pad = (num) => {
  if (num <= 0) {
    return '';
  }
  return _.range(num).map(() => ' ').join('');
};

exports.wrap = (output) => {
  return _.isArray(output) ?
    ['', ...output, ''].join(EOL) :
    ['', output, ''].join(EOL);
};

exports.resolveIssueKey$ = (issueKey) =>
  Observable.of(issueKey)
    .do((issueKey) => {
      if (!issueKey) {
        throw new Error('no issue');
      }
    })
    .catch(() => [basename(process.cwd())])
    .do((issueKey) => {
      const reverse = issueKey.split('').reverse().join('');
      if (!reverse.match(ISSUE_REGEX)) {
        throw new Error('dir does not formatted as issue key');
      }
    })
    .catch(() => branch$())
    .do((issueKey) => {
      const reverse = issueKey.split('').reverse().join('');
      if (!reverse.match(ISSUE_REGEX)) {
        throw new Error('branch does not formatted as issue key');
      }
    });

exports.resolveVersion$ = (version, options) =>
  Observable.of(version)
    .do((version) => {
      if (!version) {
        throw new Error('no version');
      }
    })
    .catch(() => latestTag$(options.identifier))
    .do((version) => {
      if (!version) {
        throw new Error('cannot resolve version');
      }
    });

exports.resolveKey$ = (key) =>
  Observable.of(key)
    .do((key) => {
      if (!key) {
        throw new Error('no key');
      }
    })
    .catch(() => [/(\w+)-\d+$/g.exec(basename(process.cwd()))])
    .do((key) => {
      if (!key) {
        throw new Error('cannot resolve project key');
      }
    });
