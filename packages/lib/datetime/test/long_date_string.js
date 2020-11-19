const { expect } = require("chai");

const { longDateString } = require("..");

describe("Converts correctly", () => {
  it("it should return an expected string based on the utc timestamp", async () => {
    const string = "2019-05-31T19:07:17+00:00";

    expect(longDateString(string)).to.equal("May 31st 2019, 7:07:17 pm");
  });
});
