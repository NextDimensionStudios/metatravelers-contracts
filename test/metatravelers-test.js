const { expectRevert } = require('@openzeppelin/test-helpers');
const { ethers } = require('hardhat');

let metaTravelers;

describe('MetaTravelers', function () {
  this.beforeEach(async () => {
    const MetaTravelers = await hre.ethers.getContractFactory('MetaTravelers');
    metaTravelers = await MetaTravelers.deploy(
      'MetaTravelers',
      'MT',
      'baseTokenUri'
    );
    await metaTravelers.deployed();
  });

  it('Should revert if the provided tokenId does not exist', async function () {
    await expectRevert(
      metaTravelers.tokenURI(0),
      'ERC721Metadata: URI query for nonexistent token.'
    );
  });
});
