import arg from "arg";
import initialize from "./core/initialize";
import syncPackage from "./core/syncPackage";
import testConnection from "./core/testConnection";
import { getDomainInstance } from "./domain";
import { RemoteConfig } from "./lib/remote/createRemote";
import { JumpRemoteConfig } from "./lib/remote/createJumpRemote";
import remoteSession from "./lib/remote/remoteSession";
import packageEnvHook from "./lib/template/packageEnvHook";
import { getEnv, getEnvNumber, getEnvStringRequired } from "./lib/utils/env";

const args = arg({
  "--test": Boolean,

  "--init": Boolean,

  "--jump": Boolean,

  "--deploy": Boolean,
  "--domain": String,
  "--env": String,
  "--message": String,
  "--verbose": Boolean,
  "--author": String,

  // Aliases
  '-v': '--verbose',
  '-m': '--message',
  '-d': '--domain',
  '-e': '--env',
  '-a': '--author',
});


//
// Remote Configs
//
const remoteConfig = (): { jump: false } & RemoteConfig => ({
  jump: false,
  port: getEnvNumber("REMOTE_PORT", 22),
  host: getEnvStringRequired("REMOTE_HOST"),
  username: getEnvStringRequired("REMOTE_USER"),
  password: getEnv("REMOTE_USER_PASSWORD"),
  privateKey: getEnv("REMOTE_PRIVATE_KEY"),
  passphrase: getEnv('REMOTE_PRIVATE_KEY_PASSPHRASE'),
});

const jumpRemoteConfig = (): { jump: true } & JumpRemoteConfig => ({
  ...remoteConfig(),
  jump: true,
  jumpHost: getEnvStringRequired("JUMP_HOST"),
  jumpHostPort: getEnvNumber("JUMP_HOST_PORT", 22),
  jumpHostUsername: getEnvStringRequired("JUMP_HOST_USER"),
  jumpHostPrivateKey: getEnvStringRequired("JUMP_HOST_PRIVATE_KEY"),
});

const config = args["--jump"] ? jumpRemoteConfig() : remoteConfig();


//
// Remote Actions
//
remoteSession(config, async remote => {

  if (args["--test"]) {
    await testConnection(remote);
    return;
  }

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
    await syncPackage(remote, domainName, {
      dir: domain.getRootDir(env),
      keep: ["runtime"],
      message: args["--message"],
      env: await domain.buildEnv(env),
      templateEnv: await domain.buildTemplateEnv(env),
      packageHook: target => packageEnvHook(domainName, env, "_env", target),
      unpackHook: target => domain.unpackHook(env, remote, target),
      verbose: args["--verbose"],
      author: args["--author"],
    });

    return;
  }

  console.warn("Did not perform any remote action.");

}).catch(e => console.error("Error: ", e));
