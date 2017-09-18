const {Observable} = require('rxjs');

exports.prompt = () => Observable.of({
  url: 'http://localhost',
  email: 'email@email.com',
  password: '1111'
});
