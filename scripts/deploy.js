async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contract with address:", deployer.address);
  
    const IdeaMarket = await ethers.getContractFactory("IdeaMarket");
    const ideaMarket = await IdeaMarket.deploy(); // no deployed() in v6
  
    await ideaMarket.waitForDeployment(); // ✅ v6 way to wait for deploy
  
    console.log("Contract deployed at:", await ideaMarket.getAddress());
  }
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  