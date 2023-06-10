import { Address } from "locklift";

async function main() {
  const signer = (await locklift.keystore.getSigner("0"))!;
  const { contract: writer, tx } = await locklift.factory.deployContract({
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
    value: locklift.utils.toNano(1),
  });

  console.log(`Writer deployed at: ${writer.address.toString()}`);
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
