const { assert, expect } = require("chai");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");
describe("BasicNft", function () {
  let basicNftContract, deployer, accounts;
  beforeEach(async function () {
    accounts = await ethers.getSigners();
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(["BasicNft"]);
    basicNftContract = await ethers.getContract("BasicNft", deployer);
  });

  describe("constructor", function () {
    it("should initialize variables correctly", async function () {
      const tokenCounter = await basicNftContract.getTokenCounter();
      const tokenName = await basicNftContract.name();
      const tokenSymbol = await basicNftContract.symbol();
      assert.equal(tokenCounter, 0);
      assert.equal(tokenName, "Dogie");
      assert.equal(tokenSymbol, "DOG");
    });
  });

  describe("minting functionality", function () {
    beforeEach(async function () {
      const tx = await basicNftContract.mintNft();
      await tx.wait(1);
    });
    it("should allows user to mint an NFT and updates it correctly", async function () {
      const tokenCounter = await basicNftContract.getTokenCounter();
      const tokenURI = await basicNftContract.tokenURI(0);
      assert.equal(tokenCounter.toString(), "1");
      assert.equal(tokenURI, await basicNftContract.TOKEN_URI());
    });

    it("Show the correct balance and owner of an NFT", async function () {
      const deployerBalance = await basicNftContract.balanceOf(deployer);
      console.log("deployer balance: ", deployerBalance);
      const owner = await basicNftContract.ownerOf("0");

      assert.equal(deployerBalance.toString(), "1");
      assert.equal(owner, deployer);
    });
  });
});
