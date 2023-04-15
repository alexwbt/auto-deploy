import fs from "fs";
import { Client } from "ssh2";
import Remote from "./Remote";
import RemoteClient from "./RemoteClient";

export type RemoteConfig = {
  port: number;
  host: string;
  username: string;
  password?: string;
  privateKey?: string;
  passphrase?: string;
  timeout?: number;
};

const createRemote = async ({
  port,
  host,
  username,
  password,
  privateKey,
  passphrase,
  timeout,
}: RemoteConfig) => {
  const _timeout = Number(timeout) > 0 ? timeout : 10000;
  const client = new Client();
  const clientPromise = new Promise<void>((res, rej) => {
    client.on("ready", res);
    client.on("error", rej);
    setTimeout(rej, _timeout);
  });

  client.connect({
    port,
    host,
    username,
    password,
    privateKey: privateKey && await fs.promises.readFile(privateKey),
    passphrase,
    timeout: _timeout,
  });

  await clientPromise;
  return new Remote(new RemoteClient(client));
};

export default createRemote;
