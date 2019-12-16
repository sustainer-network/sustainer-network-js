const { prompt } = require("inquirer");
const normalize = require("@blossm/normalize-cli");
const roboSay = require("@blossm/robo-say");
const { create: createSecret } = require("@blossm/gcp-secret");
const rootDir = require("@blossm/cli-root-dir");

const environmentSuffix = env => {
  switch (env) {
    case "production":
      return "";
    case "sandbox":
      return "-sandbox";
    case "staging":
      return "-staging";
  }
};

const create = async input => {
  const environment = input.environment;

  const blossmConfig = rootDir.config();
  await createSecret(input.name, input.message, {
    project: `${blossmConfig.vendors.cloud.gcp.project}${environmentSuffix(
      environment
    )}`,
    ring: "secret-bucket",
    location: "global",
    bucket: `${blossmConfig.vendors.cloud.gcp.secretsBucket}${environmentSuffix(
      environment
    )}`
  });
};

module.exports = async args => {
  const input = await normalize({
    entrypointType: "name",
    args,
    flags: [
      {
        name: "message",
        short: "-m",
        type: String
      },
      {
        name: "environment",
        short: "-e",
        type: String,
        choices: ["production", "sandbox", "staging"],
        default: "staging"
      }
    ]
  });
  if (!input.message) {
    const { message } = await prompt({
      type: "string",
      name: "message",
      message: roboSay(`What's the secret?`)
    });
    input.message = message;
  }
  if (!input.environment) {
    const { environment } = await prompt({
      type: "list",
      choices: ["production", "sandbox", "staging"],
      name: "environment",
      message: roboSay(`What's environment is this for?`)
    });
    input.environment = environment;
  }

  create(input);
};
