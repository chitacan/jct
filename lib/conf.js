const Conf = require('conf');
const {Observable} = require('rxjs');

exports.conf = conf = new Conf();

exports.get$ = Observable.create((subs) => {
  const url = conf.get('url');
  const auth = conf.get('auth');

  if (!url) {
    subs.error({message: 'no url. try "jct login" first.'});
  } else if (!auth) {
    subs.error({message: 'no auth. try "jct login" first.'});
  } else {
    subs.next({url, auth});
    subs.complete();
  }
});

