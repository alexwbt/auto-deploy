import { getEnvStringRequired } from "../../lib/utils/env";
import Domain from "../Domain";

export type AlexwbtEnv = {
  CERT_EMAIL: string;
  REMOTE_USER: string;
  ALEXWBT_DOMAIN: string;
};

export default class AlexwbtDomain extends Domain<AlexwbtEnv> {

  constructor() {
    super("alexwbt.com");
  }

  public buildEnv(env: string) {
    const output = {
      "prod": {
        ALEXWBT_DOMAIN: "alexwbt.com",
        CERT_EMAIL: "alexwbtg@gmail.com",
        REMOTE_USER: getEnvStringRequired("REMOTE_USER"),
      },
    }[env];
    if (output)
      return output;

    throw new Error("Failed to build env.");
  }

}
