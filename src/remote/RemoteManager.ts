import RemotePM from "./pm/RemotePM";
import RemoteYum from "./pm/RemoteYum";
import Remote from "./Remote";
import RemoteGit from "./software/RemoteGit";

export default class RemoteManager {

  public readonly pm: RemotePM;
  public readonly git: RemoteGit;

  constructor(private remote: Remote) {
    this.pm = new RemoteYum(remote);
    this.git = new RemoteGit(remote);
  }

  public end() {
    this.remote.end();
  }

}
