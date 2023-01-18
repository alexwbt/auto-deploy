import RemoteSoftware from "../RemoteSoftware";

export default abstract class RemotePM extends RemoteSoftware {

  public abstract installGit(): Promise<void>;

}
