module.exports = {
  // eslint-disable-next-line no-promise-executor-return
  delay: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
};
