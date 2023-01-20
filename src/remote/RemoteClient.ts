import { Client } from "ssh2";
import tar from "tar";
import fs from "fs";
import util from "util";

export type RemoteExecConfig = {
  on_stdout?: (data: string) => void;
  on_stderr?: (data: string) => void;
  on_data?: (data: Buffer) => void;
  on_error_data?: (data: Buffer) => void;
};

export type RemoteExecResult = {
  command: string;
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
    on_stdout, on_stderr, on_data, on_error_data
  }: RemoteExecConfig = {}) {
    return new Promise<RemoteExecResult>((res, rej) => {
      let stdout = "";
      let stderr = "";
      this.client.exec(command, (err, stream) => {
        if (err) {
          rej(err);
          return;
        }
        stream.on("close", (code: number) => {
          const result = { command, code, stdout, stderr };
          if (code === 0) res(result);
          else rej(result);
        });
        stream.on("data", (data: Buffer) => {
          on_data && on_data(data);
          on_stdout && on_stdout(`${data}`);
          stdout += `${data}`;
        });
        stream.stderr.on("data", (data: Buffer) => {
          on_error_data && on_error_data(data);
          on_stderr && on_stderr(`${data}`)
          stderr += `${data}`;
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
