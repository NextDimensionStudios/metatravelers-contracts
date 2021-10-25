async function main() {
  const [deployer] = await ethers.getSigners();
  const contractName = 'MT';
  const contractSymbol = 'MT';
  const baseTokenURI = 'uri';

  // Rinkeby LINK
  const vrfCoordinator = '0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B';
  const linkToken = '0x01BE23585060835E02B77ef475b0Cc51aA1e0709';
  const keyhash =
    '0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311';
  const fee = '100000000000000000';

  console.log('Deploying contracts with the account:', deployer.address);
  console.log('Account balance:', (await deployer.getBalance()).toString());

  const MetaTravelers = await ethers.getContractFactory('MetaTravelers');
  const metaTravelers = await MetaTravelers.deploy(
    contractName,
    contractSymbol,
    baseTokenURI,
    vrfCoordinator,
    linkToken,
    keyhash,
    fee
  );
  await metaTravelers.deployed();

  console.log('MetaTravelers address:', metaTravelers.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
