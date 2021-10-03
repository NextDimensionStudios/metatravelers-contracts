const { expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const { ethers } = require('hardhat');

const MAX_SUPPLY = 7777;
const MAX_QUANTITY = 3;
const PRICE = 0.123;
const tokenName = 'NDS Test';
const tokenSymbol = 'NDS1';
const baseTokenURI = 'baseTokenURI/';

let metaTravelers, owner, address1, address2;

describe('MetaTravelers', function () {
  this.beforeEach(async () => {
    const MetaTravelers = await hre.ethers.getContractFactory('MetaTravelers');
    metaTravelers = await MetaTravelers.deploy(
      'MetaTravelers',
      'MT',
      baseTokenURI
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
    const wrongQuantity = MAX_QUANTITY + 1;
    const total = PRICE * wrongQuantity;
    await expectRevert(
      metaTravelers.mint(address1.address, wrongQuantity, {
        value: ethers.utils.parseEther(total.toString())
      }),
      'Order exceeds max quantity'
    );
  });

  it('should revert if value sent is less than the price', async () => {
    const price = PRICE / 2;
    const quantity = 1;
    const total = price * quantity;
    await expectRevert(
      metaTravelers.mint(address1.address, quantity, {
        value: ethers.utils.parseEther(total.toString())
      }),
      'Ether value sent is not correct'
    );
  });

  // TODO: Write test
  it('should revert if new supply exceeds max supply', async () => {});

  it('should mint the specified quantity', async () => {
    const total = PRICE * MAX_QUANTITY;

    await metaTravelers.unpause({ from: owner.address });

    await metaTravelers.mint(address1.address, MAX_QUANTITY, {
      value: ethers.utils.parseEther(total.toString())
    });

    let tokenURI;
    for (i = 0; i < MAX_QUANTITY; i++) {
      tokenURI = await metaTravelers.tokenURI(i);
      expect(tokenURI).to.equal(`${baseTokenURI}${i}`);
    }
  });
});
