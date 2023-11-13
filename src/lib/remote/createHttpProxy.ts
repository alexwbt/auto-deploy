import http from "http";
import { Socket } from "net";

const createHttpProxy = (
  remoteHost: string,
  remotePort: number,
  httpProxyHost: string,
  httpProxyPort: number,
  timeout: number
) => new Promise<Socket>((resolve, reject) => {

  const req = http.request({
    host: httpProxyHost,
    port: httpProxyPort,
    method: 'CONNECT',
    path: `${remoteHost}:${remotePort}`,
  });
  req.end();

  req.on('connect', (res, socket) => {
    console.log(`connected http proxy (statusCode: ${res.statusCode})`);
    resolve(socket);
  });

  setTimeout(() => reject("http proxy connection timeout"), timeout);
});

export default createHttpProxy;
