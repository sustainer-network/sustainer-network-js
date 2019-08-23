const deps = require("./deps");
const config = require("./config");

const validate = require("./src/validate");
const clean = require("./src/clean");
const authorize = require("./src/authorize");
const version = require("./src/version");

module.exports = async ({ body, tokens, publishEventFn }) => {
  await authorize({ body, tokens });
  await deps.cleanCommand(body);
  await clean(body);
  await deps.validateCommand(body);
  await validate(body);
  await deps.normalizeCommand(body);
  const { payload, response } = await deps.main(body);
  const event = await deps.createEvent(body, {
    ...config,
    version,
    payload
  });
  await publishEventFn(event);
  return response;
};
