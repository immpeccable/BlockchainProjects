const { assert, expect } = require("chai");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

console.log("hello world");

!developmentChains.includes(networkConfig[network.config.chainId].name)
  ? describe.skip
  : describe("Random Ipfs Nft ", function () {
      let randomIpfs,
        deployer,
        chainId = network.config.chainId,
        vrfCoordinatorV2Mock;
      beforeEach(async function () {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];

        await deployments.fixture(["randomIpfs", "mocks"]);

        randomIpfs = await ethers.getContract("RandomIpfsNft", deployer);
        vrfCoordinatorV2Mock = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        );
      });

      describe("constructor", function () {
        it("should set the inital values correctly", async function () {
          const tokenUri = await randomIpfs.getDogTokenUris(0);
          const mintFee = await randomIpfs.getMintFee();
          const callbackGasLimit = await randomIpfs.getCallbackGasLimit();
          const tokenCounter = await randomIpfs.getTokenCounter();
          assert.equal(
            ethers.utils.formatEther(mintFee.toString()),
            networkConfig[chainId].mintFee
          );
          assert.equal(tokenCounter.toString(), "0");
          assert.equal(
            callbackGasLimit,
            networkConfig[chainId].callbackGasLimit
          );
          assert(tokenUri.includes("ipfs://"));
        });
      });

      describe("Request Nft", function () {
        it("should revert when enough ETH is not send", async function () {
          await expect(
            randomIpfs.requestNft({
              value: ethers.utils.parseEther("0.001"),
            })
          ).to.be.revertedWith("RandomIpfsNft__NeedMoreETHSent");
        });
        it("should fire nft requested event and add sender to the list", async function () {
          let requestId;
          await new Promise(async function (resolve, reject) {
            randomIpfs.once("NftRequested", async () => {
              console.log("Nft is requested!!");
              resolve();
            });
            const tx = await randomIpfs.requestNft({
              value: ethers.utils.parseEther("0.01"),
            });
            const txReceipt = await tx.wait(1);
            requestId = txReceipt.events[1].args.requestId;
          });
          assert.equal(
            deployer.address,
            await randomIpfs.getSenderFromRequestId(requestId)
          );
        });
      });
      describe("fulfill random words", function () {
        it("mints nft after random number is returned", async function () {
          await new Promise(async (resolve, reject) => {
            randomIpfs.once("NftMinted", async () => {
              console.log("NFT minted!!");
              try {
                const tokenUri = await randomIpfs.tokenURI("0");
                const tokenCounter = await randomIpfs.getTokenCounter();
                assert.equal(tokenUri.toString().includes("ipfs://"), true);
                assert.equal(tokenCounter.toString(), "1");
                resolve();
              } catch (e) {
                console.log(e);
                reject(e);
              }
              resolve();
            });

            try {
              const fee = await randomIpfs.getMintFee();
              const nftRequestResponse = await randomIpfs.requestNft({
                value: fee.toString(),
              });
              const nftRequestReceipt = await nftRequestResponse.wait(1);
              await vrfCoordinatorV2Mock.fulfillRandomWords(
                nftRequestReceipt.events[1].args.requestId,
                randomIpfs.address
              );
              console.log(fee, nftRequestReceipt.events[1].args.requestId);
            } catch (e) {
              console.error(e);
              reject();
            }
          });
        });
      });
    });
