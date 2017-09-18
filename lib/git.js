const {Observable} = require('rxjs');
const {exec} = require('child_process');
const {EOL} = require('os');
const {inc} = require('semver');

const exec$ = Observable.bindNodeCallback(exec);

exports.ghURL$ = () => {
  return exec$('git remote get-url origin')
    .map(([stdout]) => stdout.split(EOL).join(''))
    .map((url) => url.replace(/\.git$/g, ''))
    .catch(() => [''])
    .map((url) => {
      if (url.length === 0) {
        return url;
      }
      return `${url}/search?type=issues&q=`;
    });
};

exports.latestTag$ = (identifier) => {
  return exec$('git describe --abbrev=0')
    .map(([stdout]) => stdout.split(EOL).join(''))
    .map((ver) => ver.replace(/^v/g, ''))
    .map((ver) => inc(ver, identifier))
    .catch(() => [null]);
};

exports.branch$ = () => {
  return exec$('git rev-parse --abbrev-ref HEAD')
    .map(([stdout]) => stdout.split(EOL).join(''));
};
