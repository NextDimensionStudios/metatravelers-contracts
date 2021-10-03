const { expectRevert } = require('@openzeppelin/test-helpers');
const { ethers } = require('hardhat');

const MAX_SUPPLY = 7777;
const MAX_QUANTITY = 10;
const PRICE = 0.1;
let metaTravelers, owner, address1, address2;

describe('MetaTravelers', function () {
  this.beforeEach(async () => {
    const MetaTravelers = await hre.ethers.getContractFactory('MetaTravelers');
    metaTravelers = await MetaTravelers.deploy(
      'MetaTravelers',
      'MT',
      'baseTokenUri'
    );
    await metaTravelers.deployed();
    [owner, address1, address2] = await ethers.getSigners();
  });

  it('Should revert if the provided tokenId does not exist', async function () {
    await expectRevert(
      metaTravelers.tokenURI(0),
      'ERC721Metadata: URI query for nonexistent token.'
    );
  });

  it('should revert if quantity exceeds max quantity', async () => {
    const price = PRICE;
    const quantity = MAX_QUANTITY + 1;
    const total = price * quantity;
    await expectRevert(
      metaTravelers.mint(address1.address, quantity, {
        value: ethers.utils.parseEther(total.toString())
      }),
      'Order exceeds max quantity'
    );
  });
});
