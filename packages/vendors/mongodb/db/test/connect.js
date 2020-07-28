const { expect } = require("chai").use(require("sinon-chai"));
const { restore, replace, replaceGetter, fake } = require("sinon");

const { connect } = require("../index");
const deps = require("../deps");

const protocol = "some-protocol";
const user = "user";
const password = "pass";
const host = "host";
const database = "db";

const baseConnectionString = `${protocol}://${user}:${password}@${host}/${database}`;

const onFake = fake();
const onceFake = fake();
const connectFake = fake();
const connectionFake = fake.returns({
  on: onFake,
  once: onceFake,
});

describe("Connects", () => {
  afterEach(() => {
    restore();
  });
  beforeEach(() => {
    replace(deps.mongoose, "connect", connectFake);
    replaceGetter(deps.mongoose, "connection", connectionFake);
  });

  it("it should connect if all the params are normal, and ommittable params omitted", () => {
    connect({ protocol, user, password, host, database });

    expect(connectFake).to.have.been.calledWith(baseConnectionString, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      reconnectTries: 20,
      reconnectInterval: 3000,
      autoIndex: false,
      poolSize: 5,
    });
  });

  it("it should connect if all the params are normal, and ommittable params are passed in", () => {
    const paramKey0 = "key0";
    const paramValue0 = "value0";
    const parameters = { some: "params" };
    parameters[paramKey0] = paramValue0;

    const poolSize = 1;
    const autoIndex = true;

    const url = "some-url";
    const urlEncodeQueryDataFake = fake.returns(url);
    replace(deps, "urlEncodeQueryData", urlEncodeQueryDataFake);

    connect({
      protocol,
      user,
      password,
      host,
      database,
      parameters,
      poolSize,
      autoIndex,
    });

    expect(urlEncodeQueryDataFake).to.have.been.calledWith(
      baseConnectionString,
      parameters
    );

    expect(connectFake).to.have.been.calledWith(url, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      reconnectTries: 20,
      reconnectInterval: 3000,
      autoIndex,
      poolSize,
    });
  });

  it("it pass along the onError callback", async () => {
    const onError = (name) => name;

    await connect({
      protocol,
      user,
      password,
      host,
      database,
      onError,
    });

    expect(onFake).to.have.been.calledWith("error", onError);
  });

  it("it pass along the onError callback", async () => {
    const onOpen = () => true;

    await connect({
      protocol,
      user,
      password,
      host,
      database,
      onOpen,
    });

    expect(onceFake).to.have.been.calledWith("open", onOpen);
  });
});

describe("Returns the right object", () => {
  afterEach(() => {
    restore();
  });

  it("it should connect if all the params are normal, and ommittable params omitted", async () => {
    const onceFake = fake();
    const onFake = fake();
    const returnValue = {
      on: onFake,
      once: onceFake,
    };
    replace(deps.mongoose, "connect", fake());
    replaceGetter(deps.mongoose, "connection", fake.returns(returnValue));

    expect(
      await connect({ protocol, user, password, host, database })
    ).to.equal(returnValue);

    expect(onceFake).to.have.been.calledOnce;
    expect(onFake).to.have.been.calledOnce;
  });
});
