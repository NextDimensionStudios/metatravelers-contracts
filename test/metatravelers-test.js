const { expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const { ethers } = require('hardhat');
ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);

describe('MetaTravelers', function () {
  const MAX_SUPPLY = 7777;
  const MAX_QUANTITY = 3;
  const PRICE = 0.09;
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
    await metaTravelers.deployed();
  });

  it('should revert if the provided tokenId does not exist', async () => {
    await expectRevert(
      metaTravelers.tokenURI(0),
      'ERC721Metadata: URI query for nonexistent token.'
    );
  });

  it('should reserve the correct quantity', async () => {
    await metaTravelers.unpause({ from: owner.address });
    await metaTravelers.reserveMetaTravelers();
    tokenURI = await metaTravelers.tokenURI(MAX_RESERVE - 1);

    for (i = 1; i < MAX_RESERVE; i++) {
      tokenURI = await metaTravelers.tokenURI(i);
      expect(tokenURI).to.equal(`${baseTokenURI}${i}`);
    }
  });

  it('should update the baseTokenURI to the expected value', async () => {
    const quantity = 1;
    const total = PRICE * quantity;

    await metaTravelers.unpause({ from: owner.address });
    await metaTravelers.togglePublicSale();
    await metaTravelers.publicSaleMint(address1.address, quantity, {
      value: ethers.utils.parseEther(total.toString())
    });

    let tokenURI = await metaTravelers.tokenURI(1);
    expect(tokenURI).to.equal(`${baseTokenURI}1`);

    const newBaseTokenURI = 'newBaseTokenURI/';
    await metaTravelers.setBaseTokenURI(newBaseTokenURI);
    tokenURI = await metaTravelers.tokenURI(1);
    expect(tokenURI).to.equal(`${newBaseTokenURI}1`);
  });

  it('should revert if setStartingIndex is called without LINK', async () => {
    await metaTravelers.connect(owner).setProvenanceHash('provenanceHash');
    await expectRevert(metaTravelers.setStartingIndex(), 'Not enough LINK');
  });

  it('should set startingIndex if the contract has LINK', async () => {
    await metaTravelers.connect(owner).setProvenanceHash('provenanceHash');
    await linkToken
      .connect(owner)
      .transfer(metaTravelers.address, ethers.utils.parseEther('100'));
    let randomRequest = await metaTravelers.connect(owner).setStartingIndex();
    const result = await randomRequest.wait();

    let event = result.events[result.events.length - 1].args;
    await vrfCoordinatorMock.callBackWithRandomness(
      event.toString(),
      '10000',
      metaTravelers.address
    );

    let newStartingIndex = await metaTravelers.startingIndex();
    expect(newStartingIndex).to.not.equal(0);
  });

  it('should revert if startingIndex is already set', async () => {
    await metaTravelers.connect(owner).setProvenanceHash('provenanceHash');
    await linkToken
      .connect(owner)
      .transfer(metaTravelers.address, ethers.utils.parseEther('100'));
    let randomRequest = await metaTravelers.connect(owner).setStartingIndex();
    const result = await randomRequest.wait();

    let event = result.events[result.events.length - 1].args;
    await vrfCoordinatorMock.callBackWithRandomness(
      event.toString(),
      '10000',
      metaTravelers.address
    );

    await expectRevert(
      metaTravelers.connect(owner).setStartingIndex(),
      'Starting index is already set'
    );
  });

  it('should revert if setting startingIndex without provenanceHash', async () => {
    await linkToken
      .connect(owner)
      .transfer(metaTravelers.address, ethers.utils.parseEther('100'));

    await expectRevert(
      metaTravelers.connect(owner).setStartingIndex(),
      'Need to set provenance hash'
    );
  });

  it('should revert if non-owner sets startingIndex', async () => {
    await metaTravelers.connect(owner).setProvenanceHash('provenanceHash');
    await linkToken
      .connect(owner)
      .transfer(metaTravelers.address, ethers.utils.parseEther('100'));

    await expectRevert(
      metaTravelers.connect(address1).setStartingIndex(),
      'Ownable: caller is not the owner'
    );
  });

  it('should withdraw funds to the contract owner', async () => {
    const quantity = 1;

    await metaTravelers.unpause({ from: owner.address });
    await metaTravelers.togglePublicSale();
    await metaTravelers.publicSaleMint(address1.address, quantity, {
      value: ethers.utils.parseEther(PRICE.toString())
    });

    const originalBalance = await owner.getBalance();
    await metaTravelers.withdraw();
    const newBalance = await owner.getBalance();

    expect(Number(newBalance)).is.greaterThan(Number(originalBalance));
  });

  it('should revert if non-owner tries to reserve MetaTravelers', async () => {
    await expectRevert(
      metaTravelers.connect(address1).reserveMetaTravelers(),
      'Ownable: caller is not the owner'
    );
  });

  it('should revert if non-owner tries to set the provenanceHash', async () => {
    await expectRevert(
      metaTravelers.connect(address1).setProvenanceHash('provenanceHash'),
      'Ownable: caller is not the owner'
    );
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
