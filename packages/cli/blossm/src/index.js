const normalize = require("@blossm/normalize-cli");
const roboSay = require("@blossm/robo-say");
const fs = require("fs");
const yaml = require("yaml");
const path = require("path");
const { red } = require("chalk");

const init = require("./init");
const secret = require("./secret");
const commandHandler = require("./command_handler");
const eventHandler = require("./event_handler");
const projection = require("./projection");
const eventStore = require("./event_store");
const viewStore = require("./view_store");
const commandGateway = require("./command_gateway");
const commandAntenna = require("./command_antenna");
const viewGateway = require("./view_gateway");
const getJobGateway = require("./get_job_gateway");
const roles = require("./roles");
const postJob = require("./post_job");
const getJob = require("./get_job");

const domains = [
  "begin",
  "config",
  "init",
  "set",
  "command-handler",
  "roles",
  "event-handler",
  "projection",
  "view-store",
  "event-store",
  "command-gateway",
  "command-antenna",
  "view-gateway",
  "get-job-gateway",
  "post-job",
  "get-job"
];

const tryShortcuts = input => {
  const inputPath =
    input.positionalArgs.length >
    input.args.filter(a => a.startsWith("-")).length
      ? input.positionalArgs[0]
      : ".";
  const configPath = path.resolve(process.cwd(), inputPath, "blossm.yaml");
  const config = yaml.parse(fs.readFileSync(configPath, "utf8"));

  if (!config.procedure) throw "Procedure not set.";

  const args = [];

  if (input.domain == "test") {
    args.push("deploy");
    args.push("--unit-test");
  } else {
    args.push(input.domain);
  }
  args.push(...input.args);

  switch (config.procedure) {
    case "command-handler":
      return commandHandler(args);
    case "event-handler":
      return eventHandler(args);
    case "projection":
      return projection(args);
    case "event-store":
      return eventStore(args);
    case "view-store":
      return viewStore(args);
    case "command-gateway":
      return commandGateway(args);
    case "view-gateway":
      return viewGateway(args);
    case "get-job-gateway":
      return getJobGateway(args);
    case "command-antenna":
      return commandAntenna(args);
    case "roles":
      return roles(args);
    case "post-job":
      return postJob(args);
    case "get-job":
      return getJob(args);
  }
};

const forward = input => {
  switch (input.domain) {
    case "init":
      return init(input.args);
    case "secret":
      return secret(input.args);
    case "command-handler":
      return commandHandler(input.args);
    case "event-handler":
      return eventHandler(input.args);
    case "projection":
      return projection(input.args);
    case "event-store":
      return eventStore(input.args);
    case "view-store":
      return viewStore(input.args);
    case "command-gateway":
      return commandGateway(input.args);
    case "roles":
      return roles(input.args);
    case "view-gateway":
      return viewGateway(input.args);
    case "get-job-gateway":
      return getJobGateway(input.args);
    case "command-antenna":
      return commandAntenna(input.args);
    case "post-job":
      return postJob(input.args);
    case "get-job":
      return getJob(input.args);
    default: {
      try {
        tryShortcuts(input);
      } catch (e) {
        //eslint-disable-next-line no-console
        console.error(
          roboSay(
            `This domain isn't recognized. Choose from one of these [${domains.join(
              ", "
            )}], or from one of these shortcuts [deploy, test]`
          ),
          red.bold("error")
        );
      }
    }
  }
};

exports.cli = async rawArgs => {
  const input = await normalize({
    entrypointType: "domain",
    args: rawArgs.slice(2)
  });

  forward(input);
};
