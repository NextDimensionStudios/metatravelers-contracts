const { expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const { ethers } = require('hardhat');
ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);

describe('PreSale Tests', () => {
  const MAX_QUANTITY = 3;
  const PRICE = 0.09;
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
    await metaTravelers.deployed();
  });

  it('should revert if non-owner tries to toggle PreSale', async () => {
    await expectRevert(
      metaTravelers.connect(address1).togglePreSale(),
      'Ownable: caller is not the owner'
    );
  });

  it('should revert if PreSale is not live', async () => {
    await expectRevert(
      metaTravelers.preSaleMint(address1.address, MAX_QUANTITY, {
        value: ethers.utils.parseEther(PRICE.toString())
      }),
      'PreSale is not live'
    );
  });

  it('should revert if sender is not on the PreSale list', async () => {
    await metaTravelers.togglePreSale();
    await expectRevert(
      metaTravelers.preSaleMint(address1.address, MAX_QUANTITY, {
        value: ethers.utils.parseEther(PRICE.toString())
      }),
      'User not on PreSale list'
    );
  });

  it('should revert if contract is paused', async () => {
    await metaTravelers.togglePreSale();
    await metaTravelers.addToPreSaleList([address1.address]);
    await expectRevert(
      metaTravelers.connect(address1).preSaleMint(address1.address, 1, {
        value: ethers.utils.parseEther(PRICE.toString())
      }),
      'ERC721Pausable: token transfer while paused'
    );
  });

  it('should revert if user tries to mint more that max quantity allowed', async () => {
    await metaTravelers.unpause();
    await metaTravelers.togglePreSale();
    await metaTravelers.addToPreSaleList([address1.address]);
    await expectRevert(
      metaTravelers
        .connect(address1)
        .preSaleMint(address1.address, MAX_QUANTITY + 1, {
          value: ethers.utils.parseEther(PRICE.toString())
        }),
      'Limit per wallet exceeded'
    );
  });

  it('should mint if user is on the PreSale list', async () => {
    await metaTravelers.unpause();
    await metaTravelers.togglePreSale();
    await metaTravelers.addToPreSaleList([address1.address]);
    await metaTravelers.connect(address1).preSaleMint(address1.address, 1, {
      value: ethers.utils.parseEther(PRICE.toString())
    });
    tokenURI = await metaTravelers.tokenURI(1);
    expect(tokenURI).to.equal(`${baseTokenURI}1`);
  });

  it('should revert if user sends less Ether than required', async () => {
    await metaTravelers.unpause();
    await metaTravelers.togglePreSale();
    await metaTravelers.addToPreSaleList([address1.address]);
    await expectRevert(
      metaTravelers.connect(address1).preSaleMint(address1.address, 1, {
        value: ethers.utils.parseEther((PRICE / 2).toString())
      }),
      'Ether value sent is not correct'
    );
  });

  it('should revert if user sends more Ether than required', async () => {
    await metaTravelers.unpause();
    await metaTravelers.togglePreSale();
    await metaTravelers.addToPreSaleList([address1.address]);
    await expectRevert(
      metaTravelers.connect(address1).preSaleMint(address1.address, 1, {
        value: ethers.utils.parseEther((PRICE * 2).toString())
      }),
      'Ether value sent is not correct'
    );
  });
});
