module.exports = ({
  context,
  port,
  mainContainerName,
  network,
  service,
  project,
  region,
  containerRegistery,
  domain,
  name,
  env,
  action,
  secretBucket,
  secretBucketKeyLocation,
  secretBucketKeyRing,
  mongodbUser,
  mongodbUserPassword,
  mongodbHost,
  mongodbDatabase,
  mongodbProtocol
}) => {
  const common = {
    container_name: `${mainContainerName}`,
    ports: [`${port}`],
    environment: {
      PORT: `${port}`,
      NODE_ENV: `${env}`,
      DOMAIN: `${domain}`,
      NETWORK: `${network}`,
      CONTEXT: `${context}`,
      SERVICE: `${service}`,
      GCP_PROJECT: `${project}-staging`,
      GCP_REGION: `${region}`,
      GCP_SECRET_BUCKET: `${secretBucket}`,
      GCP_KMS_SECRET_BUCKET_KEY_LOCATION: `${secretBucketKeyLocation}`,
      GCP_KMS_SECRET_BUCKET_KEY_RING: `${secretBucketKeyRing}`
    }
  };

  const commonDatabaseEnv = {
    MONGODB_USER: `${mongodbUser}`,
    MONGODB_HOST: `${mongodbHost}`,
    MONGODB_USER_PASSWORD: `${mongodbUserPassword}`,
    MONGODB_DATABASE: `${mongodbDatabase}`,
    MONGODB_PROTOCOL: `${mongodbProtocol}`
  };

  const commonImagePrefix = `${containerRegistery}/${service}.${context}.${domain}`;

  switch (context) {
    case "view-store":
      return {
        image: `${commonImagePrefix}.${name}:latest`,
        ...common,
        environment: {
          NAME: `${name}`,
          ...common.environment,
          ...commonDatabaseEnv
        }
      };
    case "event-store":
      return {
        image: `${commonImagePrefix}:latest`,
        ...common,
        environment: {
          ...common.environment,
          ...commonDatabaseEnv
        }
      };
    case "command-handler":
      return {
        image: `${commonImagePrefix}.${action}:latest`,
        ...common,
        environment: {
          ...common.environment,
          ACTION: `${action}`
        }
      };
    case "event-handler":
      return {
        image: `${commonImagePrefix}.did-${action}.${name}:latest`,
        ...common,
        environment: {
          ...common.environment,
          ACTION: `${action}`,
          NAME: `${name}`
        }
      };
    case "job":
      return {
        image: `${commonImagePrefix}.${name}:latest`,
        ...common,
        environment: {
          ...common.environment,
          NAME: `${name}`
        }
      };
    case "command-gateway":
      return {
        image: `${commonImagePrefix}:latest`,
        ...common
      };
    case "auth-gateway":
      return {
        image: `${commonImagePrefix}:latest`,
        ...common
      };
  }
};
