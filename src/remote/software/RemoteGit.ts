import simpleGit from "simple-git";
import { RemoteExecResult } from "../RemoteClient";
import RemoteSoftware from "./RemoteSoftware";

export type GitOption = {
  dir?: string;
  message?: string;
  author?: string;
};

export default class RemoteGit extends RemoteSoftware {

  private gitCmd(cmd: string, option: GitOption) {
    // git option
    const gitOptionStr = [
      option.dir && `-C ${option.dir}`,
    ].filter(o => o).join(" ");

    // cmd option
    const cmdOptionStr = [
      option.message && `-m "${option.message}"`,
      option.author && `--author="${option.author}"`,
    ].filter(o => o).join(" ");

    // return cmd
    return `git ${gitOptionStr} ${cmd} ${cmdOptionStr}`;
  }

  public async version(): Promise<string> {
    const result = await this.client.exec("git --version");
    return result.stdout;
  }

  public init(option: GitOption = {}): Promise<RemoteExecResult> {
    return this.client.exec(this.gitCmd("init", option));
  }

  public status(option: GitOption = {}): Promise<RemoteExecResult> {
    return this.client.exec(this.gitCmd("status", option));
  }

  public diffHead(option: GitOption = {}): Promise<RemoteExecResult> {
    return this.client.exec(this.gitCmd("add -N .", option) + "&& " + this.gitCmd("diff HEAD", option));
  }

  public add(option: GitOption = {}): Promise<RemoteExecResult> {
    return this.client.exec(this.gitCmd("add .", option));
  }

  public async commit(option: GitOption = {}): Promise<RemoteExecResult> {
    const git = simpleGit();
    const [user, email] = await Promise.all([
      git.getConfig("user.name", "global"),
      git.getConfig("user.email", "global"),
    ]);
    return await this.client.exec(this.gitCmd("commit", {
      author: `${user.value} <${email.value}>`,
      ...option,
    }));
  }

}
