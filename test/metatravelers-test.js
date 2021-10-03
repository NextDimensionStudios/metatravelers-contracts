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

  it('Should revert if the provided tokenId does not exist', async () => {
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

  it('should revert if value sent is not enough', async () => {
    const value = PRICE / 2;
    const quantity = 1;
    const total = value * quantity;

    await expectRevert(
      metaTravelers.mint(address1.address, quantity, {
        value: ethers.utils.parseEther(total.toString())
      }),
      'Ether value sent is not correct'
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

  it('should revert if contract is paused', async () => {
    const quantity = 1;

    await expectRevert(
      metaTravelers.mint(address1.address, quantity, {
        value: ethers.utils.parseEther(PRICE.toString())
      }),
      'ERC721Pausable: token transfer while paused'
    );
  });

  it('should withdraw funds to the contract owner', async () => {
    const quantity = 1;

    await metaTravelers.unpause({ from: owner.address });
    await metaTravelers.mint(address1.address, quantity, {
      value: ethers.utils.parseEther(PRICE.toString())
    });

    const originalBalance = await owner.getBalance();
    await metaTravelers.withdraw();
    const newBalance = await owner.getBalance();

    expect(Number(newBalance)).is.greaterThan(Number(originalBalance));
  });

  it('should revert if non-owner tries to pause', async () => {
    await expectRevert(
      metaTravelers.connect(address1).pause(),
      'Ownable: caller is not the owner'
    );
  });
  it('should revert if non-owner tries to unpause', async () => {
    await expectRevert(
      metaTravelers.connect(address1).unpause(),
      'Ownable: caller is not the owner'
    );
  });
  it('should revert if non-owner tries to set base token URI', async () => {
    await expectRevert(
      metaTravelers.connect(address1).setBaseTokenURI('newBaseTokenURI'),
      'Ownable: caller is not the owner'
    );
  });
  it('should revert if non-owner tries to withdraw', async () => {
    await expectRevert(
      metaTravelers.connect(address1).withdraw(),
      'Ownable: caller is not the owner'
    );
  });
});
