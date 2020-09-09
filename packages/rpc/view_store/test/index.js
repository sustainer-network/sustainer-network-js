const { expect } = require("chai").use(require("sinon-chai"));
const { restore, replace, fake } = require("sinon");

const deps = require("../deps");
const viewStore = require("..");

const name = "some-name";
const context = "some-context";
const network = "some-network";

const internalTokenFn = "some-internal-token-fn";
const externalTokenFn = "some-external-token-fn";
const currentToken = "some-current-token";
const key = "some-key";

const query = "some-query";
const id = "some-id";
const sort = "some-sort";
const bootstrap = "some-bootstrap";
const limit = "some-limit";
const skip = "some-skip";
const text = "some-text";
const contexts = { c: 2 };

const envContext = "some-env-context";
process.env.NETWORK = network;

describe("Get views", () => {
  beforeEach(() => {
    process.env.CONTEXT = envContext;
  });
  afterEach(() => {
    restore();
  });

  it("should call read with the correct params", async () => {
    const views = "some-views";
    const withFake = fake.returns({ body: views });
    const inFake = fake.returns({
      with: withFake,
    });
    const getFake = fake.returns({
      in: inFake,
    });
    const rpcFake = fake.returns({
      get: getFake,
    });
    replace(deps, "rpc", rpcFake);

    const { body: result } = await viewStore({
      name,
      context,
      network,
    })
      .set({
        context: contexts,
        currentToken,
        token: {
          internalFn: internalTokenFn,
          externalFn: externalTokenFn,
          key,
        },
      })
      .read({ query, sort, id, bootstrap, text, limit, skip });

    expect(rpcFake).to.have.been.calledWith(name, context, "view-store");
    expect(getFake).to.have.been.calledWith({
      query,
      sort,
      id,
      bootstrap,
      text,
      limit,
      skip,
    });
    expect(inFake).to.have.been.calledWith({ context: contexts });
    expect(withFake).to.have.been.calledWith({
      internalTokenFn,
      externalTokenFn,
      currentToken,
      key,
    });
    expect(result).to.equal(views);
  });
  it("should call read with the correct params and optionals omitted", async () => {
    const views = "some-views";
    const withFake = fake.returns({ body: views });
    const inFake = fake.returns({
      with: withFake,
    });
    const getFake = fake.returns({
      in: inFake,
    });
    const rpcFake = fake.returns({
      get: getFake,
    });
    replace(deps, "rpc", rpcFake);

    const result = await viewStore({ name }).read();

    expect(rpcFake).to.have.been.calledWith(name, envContext, "view-store");
    expect(getFake).to.have.been.calledWith();
    expect(inFake).to.have.been.calledWith({});
    expect(withFake).to.have.been.calledWith({});
    expect(result).to.deep.equal({ body: views });
  });
  it("should call read with the correct params onto other host", async () => {
    const views = "some-views";
    const withFake = fake.returns({ body: views });
    const inFake = fake.returns({
      with: withFake,
    });
    const getFake = fake.returns({
      in: inFake,
    });
    const rpcFake = fake.returns({
      get: getFake,
    });
    replace(deps, "rpc", rpcFake);

    const otherNetwork = "some-other-network";
    delete process.env.CONTEXT;
    const { body: result } = await viewStore({
      name,
      network: otherNetwork,
    })
      .set({ context: contexts, token: { externalFn: externalTokenFn, key } })
      .read({ query, sort });

    expect(rpcFake).to.have.been.calledWith(name, "view-store");
    expect(getFake).to.have.been.calledWith({ query, sort });
    expect(inFake).to.have.been.calledWith({
      context: contexts,
      network: otherNetwork,
      host: "v.some-other-network",
    });
    expect(withFake).to.have.been.calledWith({
      externalTokenFn,
      key,
      path: "/some-name",
    });
    expect(result).to.equal(views);
  });
  it("should call stream with the correct params", async () => {
    const views = "some-views";
    const withFake = fake.returns({ body: views });
    const inFake = fake.returns({
      with: withFake,
    });
    const streamFake = fake.returns({
      in: inFake,
    });
    const rpcFake = fake.returns({
      stream: streamFake,
    });
    replace(deps, "rpc", rpcFake);

    const fn = "some-fn";
    const parallel = "some-parallel";
    const { body: result } = await viewStore({
      name,
      context,
      network,
    })
      .set({
        context: contexts,
        currentToken,
        token: {
          internalFn: internalTokenFn,
          externalFn: externalTokenFn,
          key,
        },
      })
      .idStream(fn, { query, sort, id, parallel });

    expect(rpcFake).to.have.been.calledWith(name, context, "view-store");
    expect(streamFake).to.have.been.calledWith(fn, { query, sort, parallel });
    expect(inFake).to.have.been.calledWith({ context: contexts });
    expect(withFake).to.have.been.calledWith({
      path: "/stream-ids",
      internalTokenFn,
      externalTokenFn,
      currentToken,
      key,
    });
    expect(result).to.equal(views);
  });
  it("should call stream with the correct params and optionals omitted", async () => {
    const views = "some-views";
    const withFake = fake.returns({ body: views });
    const inFake = fake.returns({
      with: withFake,
    });
    const streamFake = fake.returns({
      in: inFake,
    });
    const rpcFake = fake.returns({
      stream: streamFake,
    });
    replace(deps, "rpc", rpcFake);

    const fn = "some-fn";
    const result = await viewStore({ name }).idStream(fn, {
      query,
    });

    expect(rpcFake).to.have.been.calledWith(name, envContext, "view-store");
    expect(streamFake).to.have.been.calledWith(fn, { query });
    expect(inFake).to.have.been.calledWith({});
    expect(withFake).to.have.been.calledWith({
      path: "/stream-ids",
    });
    expect(result).to.deep.equal({ body: views });
  });
  it("should call stream with the correct params onto other host", async () => {
    const views = "some-views";
    const withFake = fake.returns({ body: views });
    const inFake = fake.returns({
      with: withFake,
    });
    const streamFake = fake.returns({
      in: inFake,
    });
    const rpcFake = fake.returns({
      stream: streamFake,
    });
    replace(deps, "rpc", rpcFake);

    const otherNetwork = "some-other-network";
    const fn = "some-fn";
    delete process.env.CONTEXT;
    const { body: result } = await viewStore({
      name,
      network: otherNetwork,
    })
      .set({ context: contexts, token: { externalFn: externalTokenFn, key } })
      .idStream(fn, { query, sort });

    expect(rpcFake).to.have.been.calledWith(name, "view-store");
    expect(streamFake).to.have.been.calledWith(fn, { query, sort });
    expect(inFake).to.have.been.calledWith({
      context: contexts,
      network: otherNetwork,
      host: "v.some-other-network",
    });
    expect(withFake).to.have.been.calledWith({
      path: "/some-name/stream-ids",
      externalTokenFn,
      key,
    });
    expect(result).to.equal(views);
  });
  it("should call update with the correct params", async () => {
    const withFake = fake.returns({});
    const inFake = fake.returns({
      with: withFake,
    });
    const putFake = fake.returns({
      in: inFake,
    });
    const rpcFake = fake.returns({
      put: putFake,
    });
    replace(deps, "rpc", rpcFake);

    const update = "some-update";
    const trace = "some-trace";
    const groups = "some-groups";
    const query = "some-query";

    const enqueueFnResult = "some-enqueue-fn-result";
    const enqueueFnFake = fake.returns(enqueueFnResult);
    const enqueueWait = "some-enqueue-wait";
    await viewStore({ name, context })
      .set({
        context: contexts,
        token: {
          internalFn: internalTokenFn,
        },
        enqueue: {
          fn: enqueueFnFake,
          wait: enqueueWait,
        },
      })
      .update({ update, query, id, trace, groups });

    expect(rpcFake).to.have.been.calledWith(name, context, "view-store");
    expect(putFake).to.have.been.calledWith(id, {
      update,
      trace,
      groups,
      query,
    });
    expect(inFake).to.have.been.calledWith({ context: contexts });
    expect(withFake).to.have.been.calledWith({
      internalTokenFn,
      enqueueFn: enqueueFnResult,
    });
    expect(enqueueFnFake).to.have.been.calledWith({
      queue: `view-store-${context}-${name}`,
      wait: enqueueWait,
    });
  });
  it("should call update with the correct params and optionals omitted", async () => {
    const withFake = fake.returns({});
    const inFake = fake.returns({
      with: withFake,
    });
    const putFake = fake.returns({
      in: inFake,
    });
    const rpcFake = fake.returns({
      put: putFake,
    });
    replace(deps, "rpc", rpcFake);

    const update = "some-update";
    await viewStore({ name }).update({ id, update });

    expect(rpcFake).to.have.been.calledWith(name, envContext, "view-store");
    expect(putFake).to.have.been.calledWith(id, { update });
    expect(inFake).to.have.been.calledWith({});
    expect(withFake).to.have.been.calledWith();
  });
  it("should call update with the correct params missing context", async () => {
    const withFake = fake.returns({});
    const inFake = fake.returns({
      with: withFake,
    });
    const putFake = fake.returns({
      in: inFake,
    });
    const rpcFake = fake.returns({
      put: putFake,
    });
    replace(deps, "rpc", rpcFake);

    const update = "some-update";
    delete process.env.CONTEXT;
    await viewStore({ name }).update({ id, update });

    expect(rpcFake).to.have.been.calledWith(name, "view-store");
    expect(putFake).to.have.been.calledWith(id, { update });
    expect(inFake).to.have.been.calledWith({});
    expect(withFake).to.have.been.calledWith();
  });
  it("should call delete with the correct params", async () => {
    const withFake = fake();
    const inFake = fake.returns({
      with: withFake,
    });
    const deleteFake = fake.returns({
      in: inFake,
    });
    const rpcFake = fake.returns({
      delete: deleteFake,
    });
    replace(deps, "rpc", rpcFake);

    const groups = "some-groups";
    await viewStore({ name, context })
      .set({
        context: contexts,
        token: {
          internalFn: internalTokenFn,
        },
      })
      .delete(id, { query, groups });

    expect(rpcFake).to.have.been.calledWith(name, context, "view-store");
    expect(deleteFake).to.have.been.calledWith(id, {
      query,
      groups,
    });
    expect(inFake).to.have.been.calledWith({ context: contexts });
    expect(withFake).to.have.been.calledWith({
      internalTokenFn,
    });
  });
  it("should call delete with the correct params with optionals omitted", async () => {
    const withFake = fake.returns({});
    const inFake = fake.returns({
      with: withFake,
    });
    const deleteFake = fake.returns({
      in: inFake,
    });
    const rpcFake = fake.returns({
      delete: deleteFake,
    });
    replace(deps, "rpc", rpcFake);

    await viewStore({ name }).delete(id);

    expect(rpcFake).to.have.been.calledWith(name, envContext, "view-store");
    expect(deleteFake).to.have.been.calledWith(id);
    expect(inFake).to.have.been.calledWith({});
    expect(withFake).to.have.been.calledWith();
  });
  it("should call delete with the correct params with no env context", async () => {
    const withFake = fake.returns({});
    const inFake = fake.returns({
      with: withFake,
    });
    const deleteFake = fake.returns({
      in: inFake,
    });
    const rpcFake = fake.returns({
      delete: deleteFake,
    });
    replace(deps, "rpc", rpcFake);

    delete process.env.CONTEXT;
    await viewStore({ name }).delete(query);

    expect(rpcFake).to.have.been.calledWith(name, "view-store");
    expect(deleteFake).to.have.been.calledWith(query);
    expect(inFake).to.have.been.calledWith({});
    expect(withFake).to.have.been.calledWith();
  });
});
