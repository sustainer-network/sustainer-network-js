const { oneLine } = require("common-tags");

module.exports = ({
  name,
  service,
  domain,
  operationHash,
  operationName,
  eventAction,
  eventDomain,
  eventService,
  procedure,
  computeUrlId,
  project,
  region
}) => {
  return {
    name: "gcr.io/cloud-builders/gcloud",
    entrypoint: "bash",
    args: [
      "-c",
      oneLine`
    gcloud beta pubsub subscriptions create ${service}-${procedure}-${operationHash}
    --topic=did-${eventAction}.${eventDomain}.${eventService}
    --push-endpoint=https://${region}-${operationName}-${operationHash}-${computeUrlId}-uc.a.run.app 
    --push-auth-token-audience=https://${region}-${operationName}-${operationHash}-${computeUrlId}-uc.a.run.app 
    --push-auth-service-account=cloud-run-pubsub-invoker@${project}.iam.gserviceaccount.com
    --topic-project=${project}
    --expiration-period=never
    --ack-deadline=30
    --project=${project}
    --labels=service=${service},procedure=${procedure},domain=${domain},name=${name},event-action=${eventAction},event-domain=${eventDomain},event-service=${eventService},hash=${operationHash} || exit 0
    `
    ]
  };
};
