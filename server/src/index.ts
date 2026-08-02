import { createServer } from 'node:http';
import { createApp } from './app.js';
import { initSocketServer } from './sockets/index.js';
import { env } from './config/env.js';

const app = createApp();
const httpServer = createServer(app);

initSocketServer(httpServer);

httpServer.listen(env.port, () => {
  console.log(`নিত্যঘর API listening on http://localhost:${env.port} (${env.nodeEnv})`);
});
