import RemoteSoftware from "./RemoteSoftware";

export default class RemoteGit extends RemoteSoftware {

  public async version(): Promise<string> {
    const result = await this.remote.exec("git --version");
    return result.stdout;
  }

}
