require("localenv");
const { expect } = require("chai");

const request = require("@blossm/request");

const { schema } = require("../../config.json");

const url = `http://${process.env.MAIN_CONTAINER_NAME}`;

const { testing, indexes = [] } = require("../../config.json");

const contextRoot = "some-context-root";
const contextService = "some-context-service";
const contextNetwork = "some-context-network";

const makeQuery = (properties, example) => {
  let obj = {};
  for (const property in properties) {
    obj[property] = example[property];
  }
  return obj;
};

describe("View store base integration tests", () => {
  const testParamQueries = async () => {
    const root = testing.examples.query.root;
    const example0 = testing.examples.query.first;
    const example1 = testing.examples.query.second;
    expect(example0).to.exist;
    expect(example1).to.exist;

    const response0 = await request.put(`${url}${root ? `/${root}` : ""}`, {
      body: {
        view: {
          body: {
            ...example0.put
          },
          headers: {
            [process.env.CONTEXT]: {
              root: contextRoot,
              service: contextService,
              network: contextNetwork
            }
          }
        }
      }
    });

    //TODO
    //eslint-disable-next-line no-console
    console.log({
      a: 1,
      context: process.env.CONTEXT,
      domain: process.env.DOMAIN,
      service: process.env.SERVICE,
      response0
    });

    expect(response0.statusCode).to.equal(204);

    const response1 = await request.get(`${url}${root ? `/${root}` : ""}`, {
      query: {
        context: {
          [process.env.CONTEXT]: {
            root: contextRoot,
            service: contextService,
            network: contextNetwork
          }
        }
      }
    });

    //TODO
    //eslint-disable-next-line no-console
    console.log({ b: 2, response1 });

    const [parsedBody1] = JSON.parse(response1.body);
    // const root = parsedBody1.headers.root;

    //TODO
    //eslint-disable-next-line no-console
    console.log({ parsedBody1 });

    expect(response1.statusCode).to.equal(200);
    for (const key in example0.get) {
      expect(parsedBody1[key]).to.deep.equal(example0.get[key]);
    }

    const response2 = await request.put(`${url}/${root}`, {
      body: {
        view: {
          body: {
            ...example1.put
          },
          headers: {
            [process.env.CONTEXT]: {
              root: contextRoot,
              service: contextService,
              network: contextNetwork
            }
          }
        }
      }
    });

    //TODO
    //eslint-disable-next-line no-console
    console.log({ response2 });

    expect(response2.statusCode).to.equal(204);

    const response3 = await request.get(`${url}/${root}`, {
      query: {
        context: {
          [process.env.CONTEXT]: {
            root: contextRoot,
            service: contextService,
            network: contextNetwork
          }
        }
      }
    });

    //TODO
    //eslint-disable-next-line no-console
    console.log({ response3 });
    expect(response3.statusCode).to.equal(200);
    const [parsedBody3] = JSON.parse(response3.body);
    //TODO
    //eslint-disable-next-line no-console
    console.log({ parsedBody3 });
    for (const key in example1.get) {
      expect(parsedBody3[key]).to.deep.equal(example1.get[key]);
    }

    const response4 = await request.delete(`${url}/${root}`);
    const parsedBody4 = JSON.parse(response4.body);
    expect(response4.statusCode).to.equal(200);
    expect(parsedBody4.deletedCount).to.equal(1);
  };

  const testIndexes = async () => {
    if (indexes.length == 0) return;
    const example0 = testing.examples.index;
    expect(example0).to.exist;

    const root = "some-index-root";

    const response = await request.put(`${url}/${root}`, {
      body: {
        view: {
          body: {
            ...example0.put
          }
        },
        headers: {
          [process.env.CONTEXT]: {
            root: contextRoot,
            service: contextService,
            network: contextNetwork
          }
        }
      }
    });

    expect(response.statusCode).to.equal(204);

    ///Test indexes
    for (const index of indexes) {
      const query = makeQuery(index[0], example0.query);
      const response1 = await request.get(url, {
        query: {
          query,
          [process.env.CONTEXT]: {
            root: contextRoot,
            service: contextService,
            network: contextNetwork
          }
        }
      });
      expect(response1.statusCode).to.equal(200);

      const [parsedBody4] = JSON.parse(response1.body);
      for (const key in example0.get) {
        if (key == "root") {
          expect(parsedBody4[0][key]).to.equal(root);
        } else {
          expect(parsedBody4[0][key]).to.deep.equal(example0.get[key]);
        }
      }
    }
  };

  const testStreaming = async () => {
    const example0 = testing.examples.stream.first;
    const example1 = testing.examples.stream.second;
    const query = testing.examples.stream.query;

    expect(example0).to.exist;
    expect(example1).to.exist;

    const root0 = "some-root";
    const root1 = "some-other-root";

    const response = await request.put(`${url}/${root0}`, {
      body: {
        view: {
          body: example0.put,
          headers: {
            [process.env.CONTEXT]: {
              root: contextRoot,
              service: contextService,
              network: contextNetwork
            }
          }
        }
      }
    });
    expect(response.statusCode).to.equal(204);
    const response1 = await request.put(`${url}/${root1}`, {
      body: {
        view: {
          body: example1.put,
          headers: {
            [process.env.CONTEXT]: {
              root: contextRoot,
              service: contextService,
              network: contextNetwork
            }
          }
        }
      }
    });
    expect(response1.statusCode).to.equal(204);
    let roots = [];
    await request.stream(
      `${url}/stream/`,
      data => {
        //TODO
        //eslint-disable-next-line no-console
        console.log({ DATA: data });
        const parsedData = JSON.parse(data.toString().trim());
        //TODO
        //eslint-disable-next-line no-console
        console.log({ oarsed: parsedData });
        roots.push(parsedData.root);

        if (data.root == root0) {
          for (const key in example0.get) {
            if (key == "root") {
              expect(parsedData[key]).to.deep.equal(root0);
            } else {
              expect(parsedData[key]).to.deep.equal(example0.get[key]);
            }
          }
        }
        if (data.roots == root1) {
          for (const key in example1.get) {
            if (key == "root") {
              expect(parsedData[key]).to.deep.equal(root1);
            } else {
              expect(parsedData[key]).to.deep.equal(example1.get[key]);
            }
          }
        }
      },
      { query: { query, context } }
    );
    expect(roots).to.include(root0);
    expect(roots).to.include(root1);
  };

  it("should return successfully", async () => {
    await testParamQueries();
    await testIndexes();
    await testStreaming();
  });

  it("should return an error if incorrect params", async () => {
    //Grab a property from the schema and pass a wrong value to it.
    for (const property in schema) {
      const badValue =
        schema[property] == "String" ||
        (typeof schema[property] == "object" &&
          schema[property]["type"] == "String")
          ? { a: 1 } //pass an object to a String property
          : "some-string"; // or, pass a string to a non-String property
      const root = "some-root";
      const response = await request.put(`${url}/${root}`, {
        body: {
          view: {
            body: { [property]: badValue },
            headers: {
              [process.env.CONTEXT]: {
                root: contextRoot,
                service: contextService,
                network: contextNetwork
              }
            }
          }
        }
      });
      expect(response.statusCode).to.equal(500);
      return;
    }
  });
});
