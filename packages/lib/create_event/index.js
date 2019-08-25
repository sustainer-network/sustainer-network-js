const datetime = require("@sustainer-network/datetime");
const deps = require("./deps");

module.exports = async ({
  root,
  payload,
  version,
  traceId,
  context,
  command: { id, action, domain, service, network, issuedTimestamp }
} = {}) => {
  const isStaging = process.env.NODE_ENV == "staging";
  return {
    fact: {
      root: root || (await deps.makeUuid()),
      topic: `did-${action}.${domain}.${service}${
        isStaging ? ".staging" : ""
      }.${network}`,
      ...(context != undefined && { context }),
      version,
      traceId,
      createdTimestamp: datetime.fineTimestamp(),
      command: {
        id,
        action,
        domain,
        service,
        network,
        issuedTimestamp
      }
    },
    payload
  };
};
