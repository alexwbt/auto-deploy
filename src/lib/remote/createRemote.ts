import fs from "fs";
import { Client } from "ssh2";
import Remote from "./Remote";
import RemoteClient from "./RemoteClient";
import createHttpProxy from "./createHttpProxy";

export type RemoteConfig = {
  port: number;
  host: string;
  username: string;
  password?: string;
  privateKey?: string;
  passphrase?: string;
  timeout?: number;

  httpProxyHost?: string;
  httpProxyPort?: number;
};

const createRemote = async ({
  port,
  host,
  username,
  password,
  privateKey,
  passphrase,
  timeout,

  httpProxyHost,
  httpProxyPort,
}: RemoteConfig) => {
  const _timeout = timeout && Number(timeout) > 0 ? timeout : 10000;

  const httpProxySocket = httpProxyHost
    ? await createHttpProxy(
      host, port,
      httpProxyHost,
      httpProxyPort || 1080, _timeout)
    : undefined;

  const client = new Client();
  const clientPromise = new Promise<void>((res, rej) => {
    client.on("ready", res);
    client.on("error", rej);
    setTimeout(() => rej("connection timeout"), _timeout);
  });

  client.connect({
    port,
    host,
    username,
    password,
    privateKey: privateKey && await fs.promises.readFile(privateKey),
    passphrase,
    timeout: _timeout,
    sock: httpProxySocket,
  });

  await clientPromise;
  return new Remote(new RemoteClient(client));
};

export default createRemote;
