exports.conf = {
  clear: jest.fn(),
  set: jest.fn(),
  get: (key) => {
    if (key === 'url') {
      return 'http://localhost/rest';
    }
    return 'auth';
  },
};

exports.get$ = [{url: 'http://localhost/rest', auth: 'auth'}];
