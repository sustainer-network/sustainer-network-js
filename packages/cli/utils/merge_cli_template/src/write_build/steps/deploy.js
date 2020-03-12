module.exports = ({
  region,
  project,
  domain,
  service,
  network,
  procedure,
  memory,
  operationHash,
  containerRegistery,
  envUriSpecifier,
  serviceName,
  secretBucket,
  secretBucketKeyLocation,
  secretBucketKeyRing,
  computeUrlId,
  extension,
  nodeEnv,
  env = "",
  labels = "",
  allowUnauthenticated = false
} = {}) => {
  return {
    name: "gcr.io/cloud-builders/gcloud",
    args: [
      "beta",
      "run",
      "deploy",
      `${serviceName}`,
      `--image=${containerRegistery}/${service}.${procedure}.${extension}`,
      "--platform=managed",
      `--memory=${memory}`,
      ...(allowUnauthenticated ? ["--allow-unauthenticated"] : []),
      `--project=${project}`,
      `--region=${region}`,
      `--set-env-vars=NODE_ENV=${nodeEnv},NETWORK=${region}.${envUriSpecifier}${network},SERVICE=${service},PROCEDURE=${procedure},DOMAIN=${domain},GCP_PROJECT=${project},GCP_REGION=${region},GCP_SECRET_BUCKET=${secretBucket},GCP_KMS_SECRET_BUCKET_KEY_LOCATION=${secretBucketKeyLocation},GCP_KMS_SECRET_BUCKET_KEY_RING=${secretBucketKeyRing},GCP_COMPUTE_URL_ID=${computeUrlId},${env}`,
      `--labels=service=${service},procedure=${procedure},domain=${domain},hash=${operationHash},${labels}`
    ]
  };
};
