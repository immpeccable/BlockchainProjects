const { network, ethers } = require("hardhat");
const { networkInterfaces } = require("os");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { verift, verify } = require("../utils/verify");
const fs = require("fs");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  let ethUsdPriceFeedAddress;
  if (developmentChains.includes(network.name)) {
    const EthUsdAggregator = await ethers.getContract("MockV3Aggregator");
    ethUsdPriceFeedAddress = EthUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId].ethUsd;
  }
  const lowSvg = await fs.readFileSync("./images/dynamicNft/frown.svg", {
    encoding: "utf-8",
  });
  const highSvg = await fs.readFileSync("./images/dynamicNft/happy.svg", {
    encoding: "utf-8",
  });
  const args = [lowSvg, highSvg, ethUsdPriceFeedAddress];
  const dynamicSvgNft = await deploy("DynamicSvgNft", {
    from: deployer,
    log: true,
    args: args,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  if (
    !developmentChains.includes(networkConfig[chainId].name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(dynamicSvgNft.address, args);
  }
};

module.exports.tags = ["all", "dynamicSvg", "main"];
