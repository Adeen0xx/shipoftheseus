import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys a contract named "ShipOfTheseusNFT" using the deployer account
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("ShipOfTheseusNFT", {
    from: deployer,
    // Contract constructor arguments
    args: [],
    log: true,
    autoMine: true,
  });

  const shipContract = await hre.ethers.getContract("ShipOfTheseusNFT", deployer);
  console.log("🚢 Ship of Theseus NFT deployed to:", shipContract.target);
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags ShipOfTheseus
deployYourContract.tags = ["ShipOfTheseusNFT"];
