require('@nomiclabs/hardhat-waffle')
require('@nomiclabs/hardhat-web3')
require('dotenv').config()
require('@nomiclabs/hardhat-etherscan')

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
	defaultNetwork: 'hardhat',
	networks: {
		hardhat: {},
		rinkeby: {
			url: 'INFURA OR ALCHEMY KEY',
			accounts: ['PRIVATE KEY'],
		},
	},
	etherscan: {
		// Your API key for Etherscan
		// Obtain one at https://etherscan.io/
		apiKey: 'API KEY',
	},
	solidity: {
		compilers: [
			{
				version: '0.4.24',
			},
			{
				version: '0.6.6',
				settings: {
					optimizer: {
						enabled: true,
						runs: 0,
					},
				},
			},
			{
				version: '0.6.12',
				settings: {
					optimizer: {
						enabled: true,
					},
				},
			},
			{
				version: '0.7.6',
				settings: {
					optimizer: {
						enabled: true,
						runs: 0,
					},
				},
			},
			{
				version: '0.8.7',
				settings: {
					optimizer: {
						enabled: true,
						runs: 0,
					},
				},
			},
			{
				version: '0.8.0',
				settings: {
					optimizer: {
						enabled: true,
						runs: 0,
					},
				},
			},
		],
	},
}
