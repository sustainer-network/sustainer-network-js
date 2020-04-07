const crypto = require("crypto");
const deps = require("./deps");

let publicKey;

module.exports = ({ url, algorithm = "SHA256" }) => async ({
  message,
  signature
}) => {
  if (!publicKey) {
    publicKey = await deps.get(url);
  }

  //TODO
  //eslint-disable-next-line
  console.log({ publicKey, signature, algorithm });

  return crypto
    .createVerify(algorithm)
    .update(message)
    .verify(publicKey, signature, "base64");
};
