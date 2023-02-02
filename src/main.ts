import arg from "arg";
import initialize from "./core/initialize";
import syncPackage from "./core/syncPackage";
import { getDomainInstance } from "./domain";
import remoteSession from "./lib/remote/remoteSession";
import { getEnvNumber, getEnvStringRequired } from "./lib/utils/env";

const remoteConfig = {
  port: getEnvNumber("REMOTE_PORT", 22),
  host: getEnvStringRequired("REMOTE_HOST"),
  username: getEnvStringRequired("REMOTE_USER"),
  privateKey: getEnvStringRequired("REMOTE_PRIVATE_KEY"),
};

(async () => {
  const args = arg({
    "--init": Boolean,

    "--deploy": Boolean,
    "--domain": String,
    "--env": String,
    "--message": String,
  });

  // remote actions
  return remoteSession(remoteConfig, async remote => {

    if (args["--init"]) {
      await initialize(remote);
      return;
    }

    if (args["--deploy"]) {
      const domainName = args["--domain"];
      if (!domainName)
        throw new Error("Domain name [--domain] is required.");

      const env = args["--env"];
      if (!env)
        throw new Error("Environment name [--env] is required.");

      const domain = getDomainInstance(domainName);
      await syncPackage(remote, domain.getName(), {
        dir: `~/${env}`,
        keep: ["runtime"],
        packageTemplate: true,
        message: args["--message"],
        env: domain.buildEnv(env),
      });

      return;
    }

    console.warn("Did not perform any remote action.");
  });
})();
