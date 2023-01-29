// import initialize from "./functions/initialize";
import syncPackage from "./functions/syncPackage";
import remoteSession from "./remote/remoteSession";
import { getEnvString, getEnvStringRequired } from "./utils/env";

remoteSession(async remote => {
  // await initialize(remote);

  await syncPackage(remote, "alexwbt.com", {
    dir: "~/prod",
    keep: ["runtime"],
    env: {
      "USER": getEnvString("REMOTE_USER", "ec2-user"),
      "CERT_EMAIL": getEnvStringRequired("CERT_EMAIL"),
    },
  });
});
