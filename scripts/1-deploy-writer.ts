async function main() {
  const signer = (await locklift.keystore.getSigner("0"))!;
  const { contract: writer, tx } = await locklift.factory.deployContract({
    contract: "Writer",
    publicKey: signer.publicKey,
    initParams: {
      owner: `0x${signer.publicKey}`,
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
