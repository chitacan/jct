jest.mock('ora');
jest.mock('../../conf');
jest.mock('../../git', () => {
  return {
    ghURL$: () => ['gh-url'],
    branch$: () => ['JRA-000'],
  };
});

const {Observable} = require('rxjs');
const {run} = require('../show');
const nock = require('nock');

describe('show', () => {
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
    .get('/api/latest/issue/JRA-000')
    .reply(200, {
      key: 'JRA-000',
      fields: {
        issuetype: {name: 'task'},
        priority: {name: 'normal'},
        status: {
          name: 'todo',
          statusCategory: {
            key: 'new',
          },
        },
        summary: 'summary',
        creator: {name: 'creator'},
        assignee: {name: 'assignee'},
        resolution: {name: 'none'},
      },
    });

    Observable.of({issue: 'id'})
      .let(run)
      .subscribe((d) => {
        done();
      }, (e) => {
        console.log(e);
        done.fail(e);
      });
  });
});
