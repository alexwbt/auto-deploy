import { Client } from "ssh2";

export type RemoteExecConfig = {
  onData?: (data: Buffer) => void;
  onErrorData?: (data: Buffer) => void;
  stdout?: (data: string) => void;
  stderr?: (data: string) => void;
};

export type RemoteExecResult = {
  code: number;
  stdout: string;
  stderr: string;
};

export default class RemoteClient {

  constructor(
    private client: Client,
  ) { }

  public end() {
    this.client.end();
  }

  public exec(command: string, {
    stdout, stderr, onData, onErrorData
  }: RemoteExecConfig = {}) {
    return new Promise<RemoteExecResult>((res, rej) => {
      let stdoutStr = "";
      let stderrStr = "";
      this.client.exec(command, (err, stream) => {
        if (err) {
          rej(err);
          return;
        }
        stream.on("close", (code: number) => {
          res({ code, stdout: stdoutStr, stderr: stderrStr });
        });
        stream.on("data", (data: Buffer) => {
          onData && onData(data);
          stdout && stdout(`${data}`);
          stdoutStr += `${data}`;
        });
        stream.stderr.on("data", (data: Buffer) => {
          onErrorData && onErrorData(data);
          stderr && stderr(`${data}`)
          stderrStr += `${data}`;
        });
      });
    });
  }

}
