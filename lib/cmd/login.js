const {prompt} = require('inquirer');
const {Observable, Subscriber} = require('rxjs');
const {resolve} = require('url');
const req$ = require('../req');
const {conf} = require('../conf');
const {spinner, wrap} = require('../utils');

const validate = (str) => {
  if (str === '') {
    return 'required';
  }
  return true;
};

exports.run = ($) =>
  $
  .switchMap(() => {
    /* eslint max-len: 0 */
    const save$ = Observable.defer(() => prompt([
      {type: 'url', name: 'url', message: 'url', validate},
      {type: 'input', name: 'email', message: 'email', validate},
      {type: 'password', name: 'password', message: 'password', mask: '*', validate},
    ]))
    .map(({url, email, password}) => {
      const auth = new Buffer(`${email}:${password}`).toString('base64');
      return {url: resolve(url, 'rest'), auth};
    })
    .do(({url, auth}) => {
      conf.set('url', url);
      conf.set('auth', auth);
    });
    const auth = conf.get('auth');
    const url = conf.get('url');
    return !!auth && !!url ? Observable.of({auth, url}) : save$;
  })
  .do(() => spinner.start())
  .map(() => ({method: 'get', url: 'auth/1/session'}))
  .switchMap((config) => Observable.of(config).let(req$))
  .map((res) => res.data)
  .do(() => spinner.stop(), () => {
    spinner.stop();
    conf.clear();
  });

exports.subscriber = Subscriber.create(({name}) => {
  console.log(wrap(`  ${'logged in as'.grey} ${name.green}`));
}, (e) => {
  console.log(wrap(`  ${e.message.red}`));
});
