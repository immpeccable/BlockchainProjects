const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const { network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const { chainId } = network.config;
  // const priceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  let ethUsdPriceFeedAddress;
  if (developmentChains.includes(network.name)) {
    let ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }
  let args = [ethUsdPriceFeedAddress];
  console.log("args: ", args);
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (
    networkConfig[chainId] &&
    !developmentChains.includes(networkConfig[chainId].name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    console.log("is verifying");
    await verify(fundMe.address, args);
  }

  log(
    "--------------------------------------------------------------------------------"
  );
};
module.exports.tags = ["all", "fundme"];
