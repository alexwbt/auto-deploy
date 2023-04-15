// import DemoProd from "./demo/DemoProd";
// import DemoUat from "./demo/DemoUat";
import Domain from "./Domain";

const DOMAIN_INSTANCES = {
  // "demo": new Domain({
  //   "uat": new DemoUat(),
  //   "prod": new DemoProd(),
  // }),
} as {
  readonly [domain: string]: Domain<any, any> | undefined;
};

export const getDomainInstance = (domain: string) => {
  const domainInstance = DOMAIN_INSTANCES[domain];
  if (!domainInstance)
    throw new Error(`Domain "${domain}" does not exist.`);

  return domainInstance;
};
