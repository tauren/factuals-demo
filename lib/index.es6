import config from 'config';
import express from 'express';
import IOServer from './IOServer';

function startServer(err) {
  if (err) {
    throw err;
  }

  let app = express();
  let server = app.listen(config.serverPort, config.serverDomain, function() {

    // Start websocket server
    // IOServer.create(server);

    let host = server.address().address;
    let port = server.address().port;

    console.log(`Factuals Demo listening at http://${host}:${port}`);

    // Create initial data

  });
}

startServer();
