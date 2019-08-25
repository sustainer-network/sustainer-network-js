const { expect } = require("chai").use(require("sinon-chai"));
const { restore, replace, fake } = require("sinon");
const deps = require("../deps");
const createAuthToken = require("..");

const secret = "SECRET!";
process.env.SECRET = secret;

const network = "network!";
process.env.NETWORK = network;

describe("Create auth token", () => {
  afterEach(() => {
    restore();
  });
  it("should execute the request correctly", async () => {
    replace(deps, "cleanCommand", fake());
    replace(deps, "validateCommand", fake());
    replace(deps, "normalizeCommand", fake());

    const event = "event!";
    const createEventFake = fake.returns(event);
    replace(deps, "createEvent", createEventFake);

    const response = "some-response";
    const payload = "some-payload";
    const mainFake = fake.returns({ payload, response });
    replace(deps, "main", mainFake);

    const issuer = "good-principle-root";
    const subject = "good-other-principle-root";

    const issuerInfo = {
      id: "good-id",
      ip: "good-ip"
    };
    const metadata = {
      a: 1,
      b: 2
    };

    const audiences = ["one", "two"];

    const params = {
      payload: {
        audiences,
        metadata,
        issuer,
        subject
      },
      issuerInfo,
      issuedTimestamp: 123
    };

    const publishEventFn = fake();

    const result = await createAuthToken({
      params,
      publishEventFn
    });

    expect(result).to.be.deep.equal(response);
    expect(deps.cleanCommand).to.have.been.calledWith(params);
    expect(deps.validateCommand).to.have.been.calledWith(params);
    expect(deps.normalizeCommand).to.have.been.calledWith(params);
    expect(deps.createEvent).to.have.been.calledWith(params, {
      action: "create",
      domain: "auth-token",
      service: "core",
      network,
      version: 0,
      payload
    });
    expect(publishEventFn).to.have.been.calledWith(event);
  });

  it("should throw correctly", async () => {
    const err = Error();
    replace(deps, "cleanCommand", fake.rejects(err));
    const params = {};

    expect(async () => await createAuthToken({ params })).to.throw;
  });
});
