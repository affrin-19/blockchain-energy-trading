const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("═══════════════════════════════════════════════════════════");
  console.log("  Blockchain-Enabled Energy Trading System — Deployment");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`  Deployer : ${deployer.address}`);
  console.log(`  Balance  : ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} ETH`);
  console.log(`  Network  : ${hre.network.name}`);
  console.log("───────────────────────────────────────────────────────────\n");

  // 1. Deploy EnergyToken
  console.log("1/3  Deploying EnergyToken...");
  const EnergyToken = await hre.ethers.getContractFactory("EnergyToken");
  const energyToken = await EnergyToken.deploy(deployer.address);
  await energyToken.waitForDeployment();
  const energyTokenAddress = await energyToken.getAddress();
  console.log(`     ✅ EnergyToken deployed at: ${energyTokenAddress}\n`);

  // 2. Deploy DynamicPricing
  const basePrice = hre.ethers.parseEther("0.001"); // 0.001 ETH per kWh
  console.log("2/3  Deploying DynamicPricing...");
  const DynamicPricing = await hre.ethers.getContractFactory("DynamicPricing");
  const dynamicPricing = await DynamicPricing.deploy(basePrice, deployer.address);
  await dynamicPricing.waitForDeployment();
  const dynamicPricingAddress = await dynamicPricing.getAddress();
  console.log(`     ✅ DynamicPricing deployed at: ${dynamicPricingAddress}\n`);

  // 3. Deploy EnergyMarket
  const platformFeeBps = 250; // 2.5%
  console.log("3/3  Deploying EnergyMarket...");
  const EnergyMarket = await hre.ethers.getContractFactory("EnergyMarket");
  const energyMarket = await EnergyMarket.deploy(
    energyTokenAddress,
    dynamicPricingAddress,
    deployer.address,
    platformFeeBps
  );
  await energyMarket.waitForDeployment();
  const energyMarketAddress = await energyMarket.getAddress();
  console.log(`     ✅ EnergyMarket deployed at: ${energyMarketAddress}\n`);

  // 4. Post-deployment configuration
  console.log("───────────────────────────────────────────────────────────");
  console.log("  Post-Deployment Configuration");
  console.log("───────────────────────────────────────────────────────────\n");

  // Authorize the market contract as a minter
  console.log("  • Setting EnergyMarket as authorized minter...");
  await energyToken.setMinter(energyMarketAddress, true);
  console.log("    ✅ Done\n");

  // Set market contract in pricing oracle
  console.log("  • Setting EnergyMarket in DynamicPricing oracle...");
  await dynamicPricing.setMarketContract(energyMarketAddress);
  console.log("    ✅ Done\n");

  // Summary
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  Deployment Summary");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`  EnergyToken    : ${energyTokenAddress}`);
  console.log(`  DynamicPricing : ${dynamicPricingAddress}`);
  console.log(`  EnergyMarket   : ${energyMarketAddress}`);
  console.log(`  Platform Fee   : ${platformFeeBps / 100}%`);
  console.log(`  Base Price     : ${hre.ethers.formatEther(basePrice)} ETH/kWh`);
  console.log("═══════════════════════════════════════════════════════════\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
