
export default abstract class Domain<EnvType> {

  constructor(
    private name: string,
  ) { }

  public abstract buildEnv(env: string): EnvType;

  public getName() {
    return this.name;
  }

}
