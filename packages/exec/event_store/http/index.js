const authorize = require("./src/authorize");
const cleanAdd = require("./src/clean_add");
const validateAdd = require("./src/validate_add");
const validateHydrate = require("./src/validate_hydrate");

const deps = require("./deps");

exports.add = async ({ body, token }) => {
  await authorize(token);
  await cleanAdd(body);
  await validateAdd(body);

  const store = deps.eventStore({
    storeId: body.storeId,
    service: body.service
  });
  store.add({ event: body.event });
};

exports.hydrate = async ({ query, token }) => {
  // eslint-disable-next-line no-console
  console.log("http hydration handler: ", query);
  await authorize(token);
  await validateHydrate(query);

  const store = deps.eventStore({
    storeId: query.storeId,
    service: query.service
  });
  const aggregateRoot = store.hydrate({ root: query.root });
  // eslint-disable-next-line no-console
  console.log("http hydration doon: ", aggregateRoot);
  return aggregateRoot;
};
