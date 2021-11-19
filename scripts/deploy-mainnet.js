async function main() {
	const [deployer] = await ethers.getSigners()
	const contractName = 'MetaTravelers: Nibiru'
	const contractSymbol = 'NIBIRU'
	const baseTokenURI =
		'ipfs://QmWzovHx5TX84ZeRLJHQAB8pBvbq4tMjZ9C2KPxRQRS4uS/'

	// Mainnet LINK
	const vrfCoordinator = '0xf0d54349aDdcf704F77AE15b96510dEA15cb7952'
	const linkToken = '0x514910771AF9Ca656af840dff83E8264EcF986CA'
	const keyhash =
		'0xAA77729D3466CA35AE8D28B3BBAC7CC36A5031EFDC430821C02BC31A238AF445'
	const fee = '2000000000000000000'

	console.log('Deploying contracts with the account:', deployer.address)
	console.log('Account balance:', (await deployer.getBalance()).toString())

	const MetaTravelers = await ethers.getContractFactory('MetaTravelers')
	const metaTravelers = await MetaTravelers.deploy(
		contractName,
		contractSymbol,
		baseTokenURI,
		vrfCoordinator,
		linkToken,
		keyhash,
		fee
	)
	await metaTravelers.deployed()

	console.log('MetaTravelers address:', metaTravelers.address)
}

main()
	.then(() => process.exit(0))
	.catch(error => {
		console.error(error)
		process.exit(1)
	})
