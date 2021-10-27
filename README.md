# Smart Contract for MetaTravelers Minting

The purpose of this contract is to provide minting of MetaTravelers, based on the ERC-721 standard. The minting process will happen sequentially via 4 sales - Early Adopter, Presale, Mint Pass, and Public Sale (in that order).

Early Adopters will be able to mint up to 5 per wallet address. Presale and Public sale addresses will be able to mint up to 3 each. Mint Pass holder's quantities will vary depending on the amount of Mint Passes the address holds at the time of the snapshot (3 mints per mint pass).

The contract will also make one call to Chainlink VRF to determine a randomized startingIndex.

This project is setup using Hardhat and includes unit testing coverage for most of the code.
Use the following command to run all tests.

```shell
npx hardhat test
```
