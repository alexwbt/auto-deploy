import { Client } from "ssh2";
import tar from "tar";
import fs from "fs";
import util from "util";

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

  public async upload(dest: string, ...src: string[]) {
    const file = "upload_tmp.tar";

    // tar
    await tar.create({ file }, src);

    // upload
    const uploadError = await new Promise<Error | undefined>(res => {
      // sftp
      this.client.sftp((err, sftp) => {
        if (err) {
          res(err);
          return;
        }
        // fastPut
        sftp.fastPut(file, file, err => {
          if (err) {
            res(err);
            return;
          }
          res(undefined);
        });
      })
    });

    // rm tmp file
    await util.promisify(fs.rm)(file);

    // throw upload error
    if (uploadError) throw uploadError;

    // move remove tmp to destination
    return await this.exec(`mkdir -p ${dest} && tar -xvf ${file} --directory ${dest} && rm ${file}`);
  }

}
