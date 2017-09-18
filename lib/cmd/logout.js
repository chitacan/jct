const {conf} = require('../conf');

module.exports = () => {
  conf.clear();
  console.log('ok'.green);
};
