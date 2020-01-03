const gateway = require("@blossm/view-gateway");
const viewStore = require("@blossm/view-store-rpc");
const { verify } = require("@blossm/gcp-kms");

const config = require("./config.json");

module.exports = gateway({
  stores: config.stores,
  whitelist: config.whitelist,
  permissionsLookupFn: async ({ principle }) => {
    const { permissions } = await viewStore({
      name: "permissions",
      domain: "principle"
    }).read({ root: principle });

    return permissions || [];
  },
  verifyFn: ({ key }) =>
    verify({
      ring: process.env.SERVICE,
      key,
      location: "global",
      version: "1",
      project: process.env.GCP_PROJECT
    })
});
