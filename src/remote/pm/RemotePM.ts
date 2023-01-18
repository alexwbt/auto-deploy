import RemoteSoftware from "../software/RemoteSoftware";

export default abstract class RemotePM extends RemoteSoftware {

  public abstract installGit(): Promise<void>;

}
