require("localenv");
const { expect } = require("chai");
const viewStore = require("@blossm/view-store-rpc");
const uuid = require("@blossm/uuid");

const request = require("@blossm/request");

const url = `http://${process.env.MAIN_CONTAINER_NAME}`;

const root = uuid();
const context = "some-context";

describe("Event handler integration tests", () => {
  it("should return successfully", async () => {
    const name = "A-name";
    const response = await request.post(url, {
      body: {
        message: {
          data: Buffer.from(
            JSON.stringify({ headers: { context, root }, payload: { name } })
          )
        }
      }
    });

    expect(response.statusCode).to.equal(204);

    const [view] = await viewStore({
      name: "some-name",
      domain: "some-domain"
    }).read({ name });

    expect(view.name).to.equal(name);

    const deletedResult = await viewStore({
      name: "some-name",
      domain: "some-domain"
    }).delete(view.id);

    expect(deletedResult.deletedCount).to.equal(1);
  });
  it("should return an error if incorrect params", async () => {
    const name = 3;
    const response = await request.post(url, {
      headers: {
        context,
        root
      },
      payload: {
        name
      }
    });

    expect(response.statusCode).to.equal(400);
  });
});
