const { assert, expect } = require("chai");
const { getNamedAccounts, ethers, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle Staging Tests", function () {
      let raffle, raffleEntranceFee, deployer;

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        raffle = await ethers.getContractAt(
          "Raffle",
          "0x93CA5A72b2CF665864219FeaB52A3889bC5424ca",
          deployer
        );
        console.log("raffle: ", raffle.address);
        raffleEntranceFee = await raffle.getEntranceFee();
      });

      describe("fulfillRandomWords", function () {
        it("works with live Chainlink Keepers and Chainlink VRF, we get a random winner", async function () {
          // enter the raffle
          console.log("Setting up test...");
          const startingTimeStamp = await raffle.getLastTimeStamp();
          const accounts = await ethers.getSigners();
          let winnerStartingBalance;

          console.log("Setting up Listener...");
          await new Promise(async (resolve, reject) => {
            console.log("inside promise");
            raffle.once("WinnerPicked", async () => {
              console.log("WinnerPicked event fired!");
              try {
                // add our asserts here
                const recentWinner = await raffle.getRecentWinner();
                console.log("recent winner is fetched", recentWinner);
                const raffleState = await raffle.getRaffleState();
                console.log("raffle state is fetched", raffleState);
                const winnerEndingBalance = await accounts[0].getBalance();
                console.log("winner balance is fetched", winnerEndingBalance);
                const endingTimeStamp = await raffle.getLastTimeStamp();
                console.log("ending timestamp is fetched", endingTimeStamp);

                await expect(raffle.getPlayer(0)).to.be.reverted;
                assert.equal(recentWinner.toString(), accounts[0].address);
                assert.equal(raffleState, 0);
                assert.equal(
                  winnerEndingBalance.toString(),
                  winnerStartingBalance.add(raffleEntranceFee).toString()
                );
                assert(endingTimeStamp > startingTimeStamp);
                resolve();
              } catch (error) { 
                console.error(error);
              }
            });
            // Then entering the raffle
            console.log("Entering Raffle...");
            const tx = await raffle.enterRaffle({ value: raffleEntranceFee });
            await tx.wait(1);
            console.log("Ok, time to wait...");
            console.log("adddress: ", accounts[0].address);
            winnerStartingBalance = await accounts[0].getBalance();
          });
        });
      });
    });
