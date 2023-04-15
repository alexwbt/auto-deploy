import AlexwbtComProd from "./alexwbt.com/AlexwbtComProd";
import Domain from "./Domain";

const DOMAIN_INSTANCES = {
  "alexwbt.com": new Domain({
    "prod": new AlexwbtComProd(),
  }),
} as {
  readonly [domain: string]: Domain<any, any> | undefined;
};

export const getDomainInstance = (domain: string) => {
  const domainInstance = DOMAIN_INSTANCES[domain];
  if (!domainInstance)
    throw new Error(`Domain "${domain}" does not exist.`);

  return domainInstance;
};
