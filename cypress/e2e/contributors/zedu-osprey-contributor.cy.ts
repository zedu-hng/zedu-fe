import { zeduOspreyContributors } from "../../../src/data/zedu-osprey-contributors";

describe("Zedu Osprey contributors", () => {
  it("keeps Pulse Tech Analytics name and username", () => {
    const contributor = zeduOspreyContributors.find(
      ({ username }) => username === "Pulse Analytics"
    );

    expect(contributor).to.deep.equal({
      name: "Pulse Tech Analytics",
      username: "Pulse Analytics",
    });
  });
});
