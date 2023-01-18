import RemoteClient from "./RemoteClient";
import RemotePM from "./software/pm/RemotePM";
import RemoteYum from "./software/pm/RemoteYum";
import RemoteGit from "./software/RemoteGit";

export default class Remote {

  public readonly pm: RemotePM;
  public readonly git: RemoteGit;

  constructor(
    public readonly client: RemoteClient
  ) {
    this.pm = new RemoteYum(client);
    this.git = new RemoteGit(client);
  }

}
