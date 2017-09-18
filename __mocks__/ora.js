const noop = () => {};
module.exports = () => {
  return {
    start: noop,
    stop: noop
  };
};
