import { expect } from "chai";
import { Address, Contract, Signer, WalletTypes, getRandomNonce, toNano } from "locklift";
import { FactorySource } from "../build/factorySource";
import { Account } from "everscale-standalone-client/nodejs";

import { lockliftChai } from "locklift";
import chai from "chai";
import { write } from "fs";
chai.use(lockliftChai);

let writer: Contract<FactorySource["Writer"]>;
let signer: Signer;
let userAccount: Account;

async function deployAccount(signer: Signer, balance: number) {
  const { account } = await locklift.factory.accounts.addNewAccount({
    type: WalletTypes.EverWallet,
    //Value which will send to the new account from a qiver
    value: toNano(balance),
    //owner publickey
    publicKey: signer.publicKey,
    nonce: getRandomNonce(),
  });

  return account;
}

describe("Test Writer contract", async function () {
  before(async () => {
    signer = (await locklift.keystore.getSigner("0"))!;
    let userAccountKey = (await locklift.keystore.getSigner("1"))!;
    userAccount = await deployAccount(userAccountKey, 20);
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
          ownerAddr: new Address(process.env.GIVER_ADDRESS as string),
          ownerPubKey: `0x${signer.publicKey}`,
          minValue: locklift.utils.toNano(5),
          tip: locklift.utils.toNano(0.1),
          postKey: 0,
          _nonce: locklift.utils.getRandomNonce(),
        },
        constructorParams: {},
        value: locklift.utils.toNano(2),
      });
      writer = contract;

      expect(await locklift.provider.getBalance(writer.address).then(balance => Number(balance))).to.be.above(0);
    });

    it("Add post", async function () {
      const NEW_STATE = "test";

      await writer.methods.addPost({ post: NEW_STATE }).sendExternal({ publicKey: signer.publicKey });

      const response = await writer.methods.getDetails({}).call();
      expect(response._state[0]).to.be.equal(NEW_STATE, "Wrong state");
    });

    it("Suggest post low payment", async function () {
      const testIpfsAddress = "testSuggestedPost";

      locklift.tracing.setAllowedCodesForAddress(writer.address, { compute: [102] });
      const { traceTree } = await locklift.tracing.trace(
        writer.methods
          .suggestPost({ ipfsAddress: testIpfsAddress })
          .send({ from: userAccount.address, amount: locklift.utils.toNano(1) }),
      );

      await traceTree?.beautyPrint();
      expect(traceTree).to.have.error(102);

      const response = await writer.methods.getPostSuggestions({}).call();
      expect(response._postSuggestions).to.be.empty;
    });

    // TODO: fix test later!
    // it("Suggest post", async function () {
    //   const testIpfsAddress = "testSuggestedPost";
    //   const amount = toNano(10);

    //   locklift.tracing.setAllowedCodesForAddress(writer.address, { compute: [102] });
    //   const { traceTree } = await locklift.tracing.trace(
    //     writer.methods
    //       .suggestPost({ ipfsAddress: testIpfsAddress })
    //       .send({ from: userAccount.address, amount: amount }),
    //   );

    //   await traceTree?.beautyPrint();

    //   const response = await writer.methods.getPostSuggestions({}).call();
    //   const suggestion = response._postSuggestions[0][1];

    //   expect(suggestion["sender"].equals(userAccount.address)).to.be.true;
    //   expect(suggestion["ipfsAddress"]).to.be.equal(testIpfsAddress);
    //   expect(suggestion["amount"]).to.be.equal(amount);
    // });

    // it("Accept post", async function () {
    //   const testPost = "testSuggestedPost";
    //   const response = await writer.methods.getPostSuggestions({}).call();
    //   const suggestion = response._postSuggestions[0][1];
    //   expect(suggestion["sender"].equals(userAccount.address)).to.be.true;

    //   await writer.methods.acceptPost({ _postKey: 0 }).sendExternal({ publicKey: signer.publicKey });
    //   const pd = await writer.methods.getDetails({}).call();
    //   expect(pd._state.includes(testPost)).to.be.true;

    //   const newSuggestedPosts = await writer.methods.getPostSuggestions({}).call();
    //   expect(newSuggestedPosts).to.be.empty;
    // });

    // it("Suggest and Reject post", async function () {
    //   const testPost = "testSuggestedPostToBeRejected";
    //   const amount = toNano(6);
    //   const senderAmountBefore = locklift.provider.getBalance(userAccount.address)

    //   await writer.methods.suggestPost({ ipfsAddress: testPost }).send({ from: userAccount.address, amount: amount });

    //   const suggestedPosts = await writer.methods.getPostSuggestions({}).call();
    //   const suggestion = suggestedPosts._postSuggestions[0][1];
    //   expect(suggestion["ipfsAddress"]).to.be.equal(testPost);

    //   const senderAmountAfter = locklift.provider.getBalance(userAccount.address)

    //   await writer.methods.rejectPost({ _postKey: 0 }).sendExternal({ publicKey: signer.publicKey });
    //   const pd = await writer.methods.getDetails({}).call();
    //   expect(pd._state.includes(testPost)).to.be.false;

    //   const senderAmountFinal = locklift.provider.getBalance(userAccount.address)

    //   const newSuggestedPosts = await writer.methods.getPostSuggestions({}).call();
    //   expect(newSuggestedPosts._postSuggestions).to.be.empty;

    //   console.log('senderAmountBefore', senderAmountBefore)
    //   console.log('senderAmountAfter', senderAmountAfter)
    //   console.log('senderAmountFinal', senderAmountFinal)
    //   console.log('newSuggestedPosts', newSuggestedPosts)
    //   console.log('pd._state', pd._state)

    // });
  });
});
