module.exports = ({
  procedure,
  port,
  mainContainerName,
  network,
  host,
  service,
  project,
  region,
  containerRegistery,
  domain,
  name,
  event,
  env,
  secretBucket,
  secretBucketKeyLocation,
  secretBucketKeyRing,
  mongodbUser,
  mongodbUserPassword,
  mongodbHost,
  mongodbDatabase,
  mongodbProtocol,
  twilioSendingPhoneNumber,
  twilioTestReceivingPhoneNumber
}) => {
  const common = {
    container_name: `${mainContainerName}`,
    ports: [`${port}`],
    environment: {
      PORT: `${port}`,
      NODE_ENV: `${env}`,
      ...(domain && { DOMAIN: `${domain}` }),
      ...(service && { SERVICE: `${service}` }),
      NETWORK: `${network}`,
      HOST: `${host}`,
      PROCEDURE: `${procedure}`,
      GCP_PROJECT: `${project}`,
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

  const commonImagePrefix = `${containerRegistery}/${procedure}`;

  switch (procedure) {
    case "view-store":
      return {
        image: `${commonImagePrefix}.${service}.${domain}.${name}:latest`,
        ...common,
        environment: {
          NAME: `${name}`,
          ...common.environment,
          ...commonDatabaseEnv
        }
      };
    case "event-store":
      return {
        image: `${commonImagePrefix}.${service}..${domain}:latest`,
        ...common,
        environment: {
          ...common.environment,
          ...commonDatabaseEnv
        }
      };
    case "command-handler":
      return {
        image: `${commonImagePrefix}.${service}.${domain}.${name}:latest`,
        ...common,
        environment: {
          ...common.environment,
          TWILIO_SENDING_PHONE_NUMBER: twilioSendingPhoneNumber,
          TWILIO_TEST_RECEIVING_PHONE_NUMBER: twilioTestReceivingPhoneNumber,
          NAME: name
        }
      };
    case "event-handler":
    case "projection":
      return {
        image: `${commonImagePrefix}.${service}.${domain}.${name}.did-${event.action}.${event.domain}:latest`,
        ...common,
        environment: {
          ...common.environment,
          NAME: `${name}`,
          EVENT_ACTION: `${event.action}`,
          EVENT_DOMAIN: `${event.domain}`,
          EVENT_SERVICE: `${event.service}`
        }
      };
    case "job":
      return {
        image: `${commonImagePrefix}.${service}.${domain}.${name}:latest`,
        ...common,
        environment: {
          ...common.environment,
          NAME: `${name}`
        }
      };
    case "command-gateway":
    case "view-gateway":
      return {
        image: `${commonImagePrefix}.${service}.${domain}:latest`,
        ...common
      };
    case "command-relay":
    case "view-relay":
      return {
        image: `${commonImagePrefix}:latest`,
        ...common
      };
  }
};
