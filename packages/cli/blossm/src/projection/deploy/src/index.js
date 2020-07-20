const eventHandler = require("@blossm/mongodb-event-handler");
const command = require("@blossm/command-rpc");
const viewStore = require("@blossm/view-store-rpc");
const eventStores = require("@blossm/event-stores-rpc");
const gcpToken = require("@blossm/gcp-token");
const nodeExternalToken = require("@blossm/node-external-token");
const channelName = require("@blossm/channel-name");
const { get: secret } = require("@blossm/gcp-secret");

const handlers = require("./handlers.js");

const config = require("./config.json");

module.exports = eventHandler({
  mainFn: async (event, { push = true }) => {
    //Must be able to handle this event.
    if (
      !handlers[event.data.headers.service] ||
      !handlers[event.data.headers.service][event.data.headers.domain] ||
      !handlers[event.data.headers.service][event.data.headers.domain][
        event.data.headers.action
      ]
    )
      return;

    const {
      //The query describing which items in the view store will be updated.
      query,
      //The changes to the body of the view.
      update,
    } = handlers[event.data.headers.service][event.data.headers.domain][
      event.data.headers.action
    ]({
      payload: event.data.payload,
      root: event.data.root,
    });

    const eventHasContext = event.data.headers.context[process.env.CONTEXT];
    //The context that the view should be associated with.
    const contextRoot = eventHasContext
      ? event.data.headers.context[process.env.CONTEXT].root
      : event.data.root;
    const contextDomain = process.env.CONTEXT;
    const contextService = eventHasContext
      ? event.data.headers.context[process.env.CONTEXT].service
      : event.data.headers.service;
    const contextNetwork = eventHasContext
      ? event.data.headers.context[process.env.CONTEXT].network
      : event.data.headers.network;

    //TODO
    console.log({ contextRoot, contextDomain, contextService, contextNetwork });
    const { body: newView } = await viewStore({
      name: config.name,
      context: config.context,
    })
      .set({
        token: { internalFn: gcpToken },
        context: {
          [contextDomain]: {
            root: contextRoot,
            service: contextService,
            network: contextNetwork,
          },
        },
      })
      .update({
        ...(query && { query }),
        update,

        //Always set the trace and context to make sure the view has an updated trace and the context is set.
        ...(event.data.headers.trace && { trace: event.data.headers.trace }),
      });

    if (!push) return;

    const channel = channelName({
      name: process.env.NAME,
      context: newView.headers.context,
    });

    await command({
      name: "push",
      domain: "updates",
      service: "system",
      network: process.env.CORE_NETWORK,
    })
      .set({
        token: {
          externalFn: nodeExternalToken,
          internalFn: gcpToken,
          key: "access",
        },
      })
      .issue({
        view: newView,
        channel,
      });
  },
  streamFn: ({ from, fn, sortFn }) =>
    eventStores(
      config.stores.map(({ domain, service, actions }) => {
        return {
          operation: [domain, service, "event-store"],
          query: {
            from,
            actions,
            parallel: 1,
          },
        };
      })
    )
      .set({
        token: { internalFn: gcpToken },
      })
      .stream(fn, sortFn),

  secretFn: secret,
});
