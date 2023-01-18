import fs from "fs";
import { Client } from "ssh2";

export type RemoteConfig = {
  port: number;
  host: string;
  username: string;
  privateKey: string;
  timeout?: number;
};

export const createRemote = async ({
  port,
  host,
  username,
  privateKey,
  timeout,
}: RemoteConfig) => {
  const _timeout = Number(timeout) > 0 ? timeout : 10000;
  const client = new Client();
  const clientPromise = new Promise<void>((res, rej) => {
    client.on("ready", res);
    client.on("error", rej);
    setTimeout(rej, _timeout);
  });

  const privateKeyData = await fs.promises.readFile(privateKey);
  client.connect({
    port,
    host,
    username,
    privateKey: privateKeyData,
    timeout: _timeout,
  });

  await clientPromise;
  return new Remote(client);
};

export default class Remote {

  constructor(
    private sshClient: Client,
  ) { }

  public end() {
    this.sshClient.end();
  }

  public uptime() {
    return new Promise<string>((res, rej) => {
      this.sshClient.exec("uptime", (err, stream) => {
        if (err) {
          rej(err);
          return;
        }
        stream.on("data", (data: Buffer) => res(`${data}`));
        stream.stderr.on("data", (data: Buffer) => rej(`${data}`));
      });
    });
  }

}
