const { expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const { ethers } = require('hardhat');
ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);

describe('MetaTravelers', function () {
  const MAX_SUPPLY = 7777;
  const MAX_QUANTITY = 3;
  const PRICE = 0.123;
  const MAX_RESERVE = 33;
  const baseTokenURI = 'baseTokenURI/';

  const keyhash =
    '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4';
  const fee = '100000000000000000';

  let owner, address1, address2;
  let MetaTravelers, VrfCoordinatorMock, LinkToken;

  before(async () => {
    [owner, address1, address2] = await ethers.getSigners();

    MetaTravelers = await hre.ethers.getContractFactory('MetaTravelers');
    VrfCoordinatorMock = await hre.ethers.getContractFactory(
      'VRFCoordinatorMock'
    );
    LinkToken = await hre.ethers.getContractFactory('LinkToken');
  });

  let metaTravelers, linkToken, vrfCoordinatorMock;
  beforeEach(async () => {
    linkToken = await LinkToken.connect(owner).deploy();

    await linkToken.deployed();
    vrfCoordinatorMock = await VrfCoordinatorMock.deploy(linkToken.address);

    metaTravelers = await MetaTravelers.deploy(
      'MetaTravelers',
      'MT',
      baseTokenURI,
      vrfCoordinatorMock.address,
      linkToken.address,
      keyhash,
      fee
    );
  });

  it('should revert if contract is paused', async () => {
    const quantity = 1;

    await metaTravelers.togglePublicSale();
    await expectRevert(
      metaTravelers.publicSaleMint(address1.address, quantity, {
        value: ethers.utils.parseEther(PRICE.toString())
      }),
      'ERC721Pausable: token transfer while paused'
    );
  });

  it('should revert if Public sale is not live', async () => {
    await expectRevert(
      metaTravelers.publicSaleMint(address1.address, MAX_QUANTITY, {
        value: ethers.utils.parseEther(PRICE.toString())
      }),
      'Public sale is not live'
    );
  });

  it('should revert if ordered quantity exceeds max quantity', async () => {
    const wrongQuantity = MAX_QUANTITY + 1;
    const total = PRICE * wrongQuantity;

    await metaTravelers.togglePublicSale();
    await expectRevert(
      metaTravelers.publicSaleMint(address1.address, wrongQuantity, {
        value: ethers.utils.parseEther(total.toString())
      }),
      'Order exceeds max quantity'
    );
  });

  it('should revert if value sent is not enough', async () => {
    const value = PRICE / 2;
    const quantity = 1;
    const total = value * quantity;

    await metaTravelers.togglePublicSale();
    await expectRevert(
      metaTravelers.publicSaleMint(address1.address, quantity, {
        value: ethers.utils.parseEther(total.toString())
      }),
      'Ether value sent is not correct'
    );
  });

  it('should revert if value sent is less than the price', async () => {
    const price = PRICE / 2;
    const quantity = 1;
    const total = price * quantity;

    await metaTravelers.togglePublicSale();
    await expectRevert(
      metaTravelers.publicSaleMint(address1.address, quantity, {
        value: ethers.utils.parseEther(total.toString())
      }),
      'Ether value sent is not correct'
    );
  });

  it('should mint the specified quantity', async () => {
    const total = PRICE * MAX_QUANTITY;

    await metaTravelers.togglePublicSale();
    await metaTravelers.unpause({ from: owner.address });
    await metaTravelers.publicSaleMint(address1.address, MAX_QUANTITY, {
      value: ethers.utils.parseEther(total.toString())
    });

    let tokenURI;
    for (i = 1; i < MAX_QUANTITY; i++) {
      tokenURI = await metaTravelers.tokenURI(i);
      expect(tokenURI).to.equal(`${baseTokenURI}${i}`);
    }
  });
});
