import AlexwbtDomain from "./alexwbt.com";
import Domain from "./Domain";

const DOMAIN_INSTANCES = {
  "alexwbt.com": new AlexwbtDomain(),
} as {
  readonly [domain: string]: Domain<any> | undefined;
};

export const getDomainInstance = (domain: string) => {
  const domainInstance = DOMAIN_INSTANCES[domain];
  if (!domainInstance)
    throw new Error(`Domain "${domain}" does not exist.`);

  return domainInstance;
};
