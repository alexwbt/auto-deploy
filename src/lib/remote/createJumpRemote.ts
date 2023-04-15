import fs from "fs";
import { Client } from "ssh2";
import Remote from "./Remote";
import RemoteClient from "./RemoteClient";

export type JumpRemoteConfig = {
  port: number;
  host: string;
  username: string;
  password?: string;
  privateKey?: string;
  passphrase?: string;

  jumpHost: string;
  jumpHostPort: number;
  jumpHostUsername: string;
  jumpHostPrivateKey: string;

  timeout?: number;
};

const createJumpRemote = async ({
  port,
  host,
  username,
  password,
  privateKey,
  passphrase,

  jumpHost,
  jumpHostPort,
  jumpHostUsername,
  jumpHostPrivateKey,

  timeout,
}: JumpRemoteConfig) => {
  const _timeout = Number(timeout) > 0 ? timeout : 10000;
  const client = new Client();
  const jumpHostClient = new Client();

  const [privateKeyData, jumpHostPrivateKeyData] = await Promise.all([
    privateKey && fs.promises.readFile(privateKey),
    fs.promises.readFile(jumpHostPrivateKey),
  ]);

  const clientPromise = new Promise<void>((res, rej) => {
    client.on("ready", res);
    client.on("error", rej);
    jumpHostClient.on("error", rej);
    setTimeout(rej, _timeout);
  });

  jumpHostClient.on("ready", () => {
    console.log("Jump host connection ready.");
    jumpHostClient.forwardOut('127.0.0.1', 8000, host, 22, (error, stream) => {
      if (error) {
        console.log('Jump Host exec error: ' + error);
        return jumpHostClient.end();
      }

      client.connect({
        sock: stream,
        port,
        host,
        username,
        password,
        privateKey: privateKeyData || undefined,
        passphrase,
        timeout: _timeout,
      });
    });
  });

  jumpHostClient.connect({
    host: jumpHost,
    port: jumpHostPort,
    username: jumpHostUsername,
    privateKey: jumpHostPrivateKeyData,
    timeout: _timeout,
  });

  await clientPromise;
  return new Remote(new RemoteClient(client, jumpHostClient));
};

export default createJumpRemote;
