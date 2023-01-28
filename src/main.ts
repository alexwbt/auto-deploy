// import initialize from "./functions/initialize";
import syncPackage from "./functions/syncPackage";
import remoteSession from "./remote/remoteSession";

remoteSession(async remote => {
  // await initialize(remote);

  await syncPackage(remote,
    ["compose", "runtime", "Makefile"],
    { envName: "uat" });
});
