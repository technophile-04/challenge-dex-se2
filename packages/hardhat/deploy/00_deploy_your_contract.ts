import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Balloons, DEX } from "../typechain-types";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, log } = hre.deployments;

  await deploy("Balloons", {
    from: deployer,
    log: true,
  });

  const balloons = await hre.ethers.getContract<Balloons>("Balloons", deployer);

  await deploy("DEX", {
    from: deployer,
    log: true,
    args: [balloons.address],
    // waitConfirmations: 5,
  });

  const dex = await hre.ethers.getContract<DEX>("DEX", deployer);

  // paste in your front-end address here to get 10 balloons on deploy:
  await balloons.transfer("0x5bE5c2FD34bAaC1c06e03F51C03dE0C49480Af46", hre.ethers.utils.parseEther("100"));

  // uncomment to init DEX on deploy:
  log("Approving DEX (" + dex.address + ") to take Balloons from main account...");
  // If you are going to the testnet make sure your deployer account has enough ETH
  await balloons.approve(dex.address, hre.ethers.utils.parseEther("100"));
  console.log("INIT exchange...");
  await dex.init(hre.ethers.utils.parseEther("5"), {
    value: hre.ethers.utils.parseEther("5"),
    gasLimit: 200000,
  });
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["DEX", "Balloons"];
