require('@nomiclabs/hardhat-waffle')
require('@nomiclabs/hardhat-web3')
require('dotenv').config()

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
	networks: {
		rinkeby: {
			// Infura or Alchemy API
			url: `${process.env.RINKEBY_URL}`,
			// Private key
			accounts: [`${process.env.RINKEBY_ACCOUNT}`],
		},
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
		],
	},
}
