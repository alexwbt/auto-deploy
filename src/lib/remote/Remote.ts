import RemoteMachines from "./machine";
import RemoteMachine from "./machine/RemoteMachine";
import RemoteClient from "./RemoteClient";
import RemoteGit from "./software/RemoteGit";
import RemoteVim from "./software/RemoteVim";

export default class Remote {
  public readonly machine: RemoteMachine;
  public readonly git: RemoteGit;
  public readonly vim: RemoteVim;

  constructor(
    public readonly client: RemoteClient,
    machine: keyof typeof RemoteMachines,
  ) {
    this.machine = new RemoteMachines[machine](client);
    this.git = new RemoteGit(client);
    this.vim = new RemoteVim(client);
  }
}
