import { expect } from "chai";
import { Contract, Signer } from "locklift";
import { FactorySource } from "../build/factorySource";

let writer: Contract<FactorySource["Writer"]>;
let signer: Signer;

describe("Test Writer contract", async function () {
  before(async () => {
    signer = (await locklift.keystore.getSigner("0"))!;
  });
  describe("Contracts", async function () {
    it("Load contract factory", async function () {
      const writerData = await locklift.factory.getContractArtifacts("Writer");

      expect(writerData.code).not.to.equal(undefined, "Code should be available");
      expect(writerData.abi).not.to.equal(undefined, "ABI should be available");
      expect(writerData.tvc).not.to.equal(undefined, "tvc should be available");
    });

    it("Deploy contract", async function () {
      const INIT_STATE = 0;
      const { contract } = await locklift.factory.deployContract({
        contract: "Writer",
        publicKey: signer.publicKey,
        initParams: {
          owner: `0x${signer.publicKey}`,
          _nonce: locklift.utils.getRandomNonce(),
        },
        constructorParams: {},
        value: locklift.utils.toNano(2),
      });
      writer = contract;

      expect(await locklift.provider.getBalance(writer.address).then(balance => Number(balance))).to.be.above(0);
    });

    it("Interact with contract", async function () {
      const NEW_STATE = "test";

      await writer.methods.addPost({post: NEW_STATE}).sendExternal({ publicKey: signer.publicKey });

      const response = await writer.methods.getDetails({}).call();
      expect(response._state[0]).to.be.equal(NEW_STATE, "Wrong state");
    });
  });
});
