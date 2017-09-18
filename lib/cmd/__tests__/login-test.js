jest.mock('ora');
jest.mock('inquirer');
jest.mock('../../conf');

const {Observable} = require('rxjs');
const {run, subscriber} = require('../login');
const nock = require('nock');

describe('login', () => {
  beforeAll(() => {
    String.prototype.__defineGetter__('red', function() {
      return this;
    });

    String.prototype.__defineGetter__('green', function() {
      return this;
    });

    String.prototype.__defineGetter__('grey', function() {
      return this;
    });
  });

  it('run', (done) => {
    nock('http://localhost/rest', {
      reqheaders: {Authorization: () => true},
    })
    .get('/auth/1/session')
    .reply(200, {});

    Observable.of({})
      .let(run)
      .subscribe((d) => {
        done();
      }, (e) => {
        done.fail(e);
      });
  });

  it('subscriber ok', () => {
    console.log = jest.fn();
    subscriber.next({name: 'name'});
    expect(console.log.mock.calls).toMatchSnapshot();
  });

  it('subscriber error', () => {
    console.log = jest.fn();
    subscriber.error({message: 'error'});
    expect(console.log.mock.calls).toMatchSnapshot();
  });

  afterAll(() => {
    console.log.mockClear();
  });
});
