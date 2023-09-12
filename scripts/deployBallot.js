const hre = require("hardhat");

deploy = async () => {
  const ballotOfficialName = "viet";
  const proposalName = "first proposal";
  const proposalContent = "this is the first proposal proposed by Viet";

  const ballot = await ethers.deployContract("Ballot", [
    ballotOfficialName,
    proposalName,
    proposalContent,
  ]);
  await ballot.waitForDeployment();

  console.log(
    `Ballot with official name ${ballotOfficialName} and proposal name: ${proposalName}, proposal content: ${proposalContent} was deployed to ${ballot.target}`
  );
};

deploy().catch((err) => {
  console.log(err);
  process.exitCode = 1;
});
