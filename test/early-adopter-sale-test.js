const { expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const { ethers } = require('hardhat');
ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);

describe('Early Adopter Sale Tests', () => {
  const MAX_QUANTITY = 3;
  const MAX_EA_QUANTITY = 5;
  const PRICE = 0.123;
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

  it('should revert if non-owner tries to toggle Early Adopter sale', async () => {
    await expectRevert(
      metaTravelers.connect(address1).toggleEarlyAdopter(),
      'Ownable: caller is not the owner'
    );
  });

  it('should revert if Early Adopter sale is not live', async () => {
    await expectRevert(
      metaTravelers.earlyAdopterMint(address1.address, MAX_QUANTITY, {
        value: ethers.utils.parseEther(PRICE.toString())
      }),
      'Early Adopter sale is not live'
    );
  });

  it('should revert if sender is not on the Early Adopter list', async () => {
    await metaTravelers.toggleEarlyAdopter();
    await expectRevert(
      metaTravelers.earlyAdopterMint(address1.address, MAX_QUANTITY, {
        value: ethers.utils.parseEther(PRICE.toString())
      }),
      'User not on Early Adopter list'
    );
  });

  it('should revert if contract is paused', async () => {
    await metaTravelers.toggleEarlyAdopter();
    await metaTravelers.addToEarlyAdopterList([address1.address]);
    await expectRevert(
      metaTravelers.connect(address1).earlyAdopterMint(address1.address, 1, {
        value: ethers.utils.parseEther(PRICE.toString())
      }),
      'ERC721Pausable: token transfer while paused'
    );
  });

  it('should revert if user tries to mint more that max quantity allowed', async () => {
    await metaTravelers.unpause();
    await metaTravelers.toggleEarlyAdopter();
    await metaTravelers.addToEarlyAdopterList([address1.address]);
    await expectRevert(
      metaTravelers
        .connect(address1)
        .earlyAdopterMint(address1.address, MAX_EA_QUANTITY + 1, {
          value: ethers.utils.parseEther(
            ((MAX_EA_QUANTITY + 1) * PRICE).toString()
          )
        }),
      'Limit per wallet exceeded'
    );
  });

  it('should mint if user is on the Early Adopter list', async () => {
    await metaTravelers.unpause();
    await metaTravelers.toggleEarlyAdopter();
    await metaTravelers.addToEarlyAdopterList([address1.address]);
    await metaTravelers
      .connect(address1)
      .earlyAdopterMint(address1.address, 1, {
        value: ethers.utils.parseEther(PRICE.toString())
      });
    tokenURI = await metaTravelers.tokenURI(1);
    expect(tokenURI).to.equal(`${baseTokenURI}1`);
  });

  it('should revert if user sends less Ether than required', async () => {
    await metaTravelers.unpause();
    await metaTravelers.toggleEarlyAdopter();
    await metaTravelers.addToEarlyAdopterList([address1.address]);
    await expectRevert(
      metaTravelers.connect(address1).earlyAdopterMint(address1.address, 1, {
        value: ethers.utils.parseEther((PRICE / 2).toString())
      }),
      'Ether value sent is not correct'
    );
  });
});
