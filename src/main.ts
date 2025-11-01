import arg from "arg";
import dotenv from "dotenv";
import buildPackage from "./core/buildPackage";
import syncPackage, { SyncConfig } from "./core/syncPackage";
import { getDomainInstance } from "./domain";
import { JumpRemoteConfig } from "./lib/remote/createJumpRemote";
import { RemoteConfig } from "./lib/remote/createRemote";
import Remote from "./lib/remote/Remote";
import remoteSession from "./lib/remote/remoteSession";
import packageEnvHook from "./lib/template/packageEnvHook";
import { getEnv, getEnvNumber, getEnvString, getEnvStringRequired } from "./lib/utils/env";

const ARGS = arg({
  "--test": Boolean,
  "--init": Boolean,
  "--jump": Boolean,
  "--package": Boolean,
  "--deploy": Boolean,
  "--domain": String,
  "--env": String,
  "--message": String,
  "--verbose": Boolean,
  "--author": String,
  "--debug": Boolean,

  // Aliases
  '-v': '--verbose',
  '-m': '--message',
  '-d': '--domain',
  '-e': '--env',
  '-a': '--author',
});
type Args = typeof ARGS;
const getRequiredArg = <K extends keyof Args>(name: K): NonNullable<Args[K]> => {
  const value = ARGS[name];
  if (!value)
    throw new Error(`Required argument ${name} is missing.`);
  return value;
};

const ARG_ENV = getRequiredArg("--env");
const ARG_DOMAIN_NAME = getRequiredArg("--domain");
const DOMAIN_INSTANCE = getDomainInstance(ARG_DOMAIN_NAME);

//
// Load Env File
//
dotenv.config({ path: `./env/${ARG_DOMAIN_NAME}.${ARG_ENV}.env` });


const buildPackageConfig = async (remote?: Remote): Promise<SyncConfig> => {
  const workDir = `${DOMAIN_INSTANCE.getRootDir(ARG_ENV)}/${ARG_DOMAIN_NAME}`;
  return {
    //
    //  build package config
    //
    package: `package/${ARG_DOMAIN_NAME}`,
    outputDir: `dist/${remote ? "sync" : "build"}/${ARG_DOMAIN_NAME}_${Date.now()}`,
    env: {
      ...await DOMAIN_INSTANCE.buildEnv(ARG_ENV),
      "WORK_DIR": workDir,
    },
    templateEnv: await DOMAIN_INSTANCE.buildTemplateEnv(ARG_ENV),
    templateExcludeRegex: await DOMAIN_INSTANCE.getTemplateExcludeRegex(ARG_ENV) || undefined,
    packageExcludeRegex: await DOMAIN_INSTANCE.getPackageExcludeRegex(ARG_ENV) || undefined,
    packageHook: packageDir => packageEnvHook(ARG_ENV, "_env", packageDir),
    //
    // sync package config
    //
    dir: workDir,
    keep: ["runtime"],
    message: ARGS["--message"],
    unpackHook: remote && (targetDir => DOMAIN_INSTANCE.unpackHook(ARG_ENV, remote, targetDir)),
    completeHook: remote && (targetDir => DOMAIN_INSTANCE.completeHook(ARG_ENV, remote, targetDir)),
    verbose: ARGS["--verbose"],
    author: ARGS["--author"],
    debug: ARGS["--debug"],
  };
};


//
// Entry Point
//
(async () => {

  if (ARGS["--package"]) {
    await buildPackage(await buildPackageConfig());
    return;
  }

  //
  // Remote Configs
  //
  const remoteConfig = (): { jump: false; } & RemoteConfig => ({
    jump: false,
    port: getEnvNumber("REMOTE_PORT", 22),
    host: getEnvStringRequired("REMOTE_HOST"),
    username: getEnvStringRequired("REMOTE_USER"),
    password: getEnv("REMOTE_USER_PASSWORD"),
    privateKey: getEnv("REMOTE_PRIVATE_KEY"),
    passphrase: getEnv('REMOTE_PRIVATE_KEY_PASSPHRASE'),
    httpProxyHost: getEnv('REMOTE_HTTP_PROXY_HOST'),
    httpProxyPort: getEnvNumber('REMOTE_HTTP_PROXY_PORT', 1080),
    machine: (() => {
      switch (getEnvString("REMOTE_MACHINE", "ec2")) {
        case "ubuntu": return "ubuntu";
        default: return "ec2";
      }
    })(),
  });

  const jumpRemoteConfig = (): { jump: true; } & JumpRemoteConfig => ({
    ...remoteConfig(),
    jump: true,
    jumpHost: getEnvStringRequired("JUMP_HOST"),
    jumpHostPort: getEnvNumber("JUMP_HOST_PORT", 22),
    jumpHostUsername: getEnvStringRequired("JUMP_HOST_USER"),
    jumpHostPrivateKey: getEnvStringRequired("JUMP_HOST_PRIVATE_KEY"),
  });

  const config = ARGS["--jump"] ? jumpRemoteConfig() : remoteConfig();
  const success = await remoteSession(config, async remote => {

    if (ARGS["--test"]) {
      console.log(await remote.client.exec("ls -la"));
      return;
    }

    if (ARGS["--init"]) {
      await DOMAIN_INSTANCE.initialize(ARG_ENV, remote);
      return;
    }

    if (ARGS["--deploy"]) {
      await syncPackage(remote, getRequiredArg("--domain"), await buildPackageConfig(remote));
      return;
    }

    console.warn("Did not perform any remote action.");

  }).catch(e => {
    console.error("Error: ", e);
    return false;
  });

  process.exit(success ? 0 : 1);

})();
