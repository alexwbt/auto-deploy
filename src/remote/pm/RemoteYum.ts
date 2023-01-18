import RemotePM from "./RemotePM";

export default class RemoteYum extends RemotePM {

  public override async installGit(): Promise<void> {
    await this.remote.exec("sudo yum update -y");
    await this.remote.exec("sudo yum install git -y");
  }

}
