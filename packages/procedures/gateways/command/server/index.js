const deps = require("./deps");

module.exports = async ({
  commands,
  domain = process.env.DOMAIN,
  service = process.env.SERVICE,
  tokenFn,
  whitelist,
  permissionsLookupFn,
  terminatedSessionCheckFn,
  verifyFn,
  keyClaimsFn
}) => {
  let server = deps.server({
    prehook: app =>
      deps.corsMiddleware({
        app,
        whitelist,
        credentials: true,
        methods: ["POST"]
      })
  });

  for (const {
    name,
    key = "access",
    priviledges,
    protected = true
  } of commands) {
    server = server.post(deps.post({ name, domain, tokenFn }), {
      path: `/${name}`,
      ...(protected && {
        preMiddleware: [
          deps.authentication({
            verifyFn: verifyFn({ key }),
            keyClaimsFn
          }),
          deps.authorization({
            permissionsLookupFn,
            terminatedSessionCheckFn,
            permissions:
              priviledges instanceof Array
                ? priviledges.map(priviledge => {
                    return { service, domain, priviledge };
                  })
                : priviledges
          })
        ]
      })
    });
  }

  server.listen();
};
