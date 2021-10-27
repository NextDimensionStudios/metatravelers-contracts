require('@nomiclabs/hardhat-waffle')
require('@nomiclabs/hardhat-web3')

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
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
