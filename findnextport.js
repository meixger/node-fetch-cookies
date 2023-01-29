const net = require("net");
module.exports = function getAvailablePort(startingAt) {
  function getNextAvailablePort(currentPort, cb) {
    const server = net.createServer();
    server.listen(currentPort, (_) => {
      server.once("close", (_) => {
        cb(currentPort);
      });
      server.close();
    });
    server.on("error", (_) => {
      getNextAvailablePort(++currentPort, cb);
    });
  }

  return new Promise((resolve) => {
    getNextAvailablePort(startingAt, resolve);
  });
};
