// import initialize from "./functions/initialize";
import syncPackage from "./functions/syncPackage";
import remoteSession from "./remote/remoteSession";
import { getEnvStringRequired } from "./utils/env";

remoteSession(async remote => {
  // await initialize(remote);

  await syncPackage(remote, "alexwbt.com", {
    dir: "~/prod",
    keep: ["runtime"],
    env: {
      "USER": getEnvStringRequired("REMOTE_USER"),
      "CERT_EMAIL": getEnvStringRequired("CERT_EMAIL"),
      "ALEXWBT_DOMAIN": getEnvStringRequired("ALEXWBT_DOMAIN"),
    },
  });
});
