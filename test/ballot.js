const { expect } = require("chai");
const hre = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
describe("Ballot", () => {
  const testAddress = "0x12ba5Df212832B3f9061bB278527448ec2B5F530";
  // using fixture
  deployBallotFixture = async () => {
    const ballotOfficialname = "Ballot tester";
    const proposalName = "test proposal";
    const proposalContent = "this is a test proposal";
    const [owner] = await ethers.getSigners();
    const ballot = await ethers.deployContract("Ballot", [
      ballotOfficialname,
      proposalName,
      proposalContent,
    ]);
    return {
      ballot,
      ballotOfficialname,
      owner,
      proposalName,
      proposalContent,
    };
  };

  it("should set the proposal of the contract", async () => {
    const { ballot, proposalName, proposalContent } = await loadFixture(
      deployBallotFixture
    );
    const proposal = await ballot.ballotProposal();
    expect(await proposal.proposalName).to.equal(proposalName);
    expect(await proposal.proposalContent).to.equal(proposalContent);
  });

  it("should set the onwer of the contract", async () => {
    const { ballot, ballotOfficialname, owner } = await loadFixture(
      deployBallotFixture
    );
    expect(await ballot.ballotOfficialAddress()).to.equal(owner.address);
    expect(await ballot.ballotOfficialName()).to.equal(ballotOfficialname);
  });
  it("should set the state of contract to be created at first", async () => {
    const { ballot } = await loadFixture(deployBallotFixture);
    expect(await ballot.state()).to.equal(0);
  });
  it("should not start vote if not the owner", async () => {
    const { ballot } = await loadFixture(deployBallotFixture);
    const fakeAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    await expect(ballot.connect(fakeAddress).startVote()).to.be.rejected;
  });

  it("should emit startVote event", async () => {
    const { ballot } = await loadFixture(deployBallotFixture);
    await expect(ballot.startVote()).to.emit(ballot, "voteStarted");
  });
  it("should not add voter if the state is Voting ", async () => {
    const { ballot } = await loadFixture(deployBallotFixture);
    await ballot.startVote();
    await expect(ballot.addVoter(testAddress, "tester")).to.be.rejected;
  });
  it("should not add voter if not the ownership", async () => {
    const { ballot } = await loadFixture(deployBallotFixture);
    const fakeAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    await expect(ballot.connect(fakeAddress).addVoter(testAddress, "tester")).to
      .be.rejected;
  });
  it("should emit event when add voter", async () => {
    const { ballot } = await loadFixture(deployBallotFixture);
    await expect(ballot.addVoter(testAddress, "tester"))
      .to.emit(ballot, "voterAdded")
      .withArgs(testAddress);
  });
  it("should successfully add voter", async () => {
    const { ballot } = await loadFixture(deployBallotFixture);
    await ballot.addVoter(testAddress, "tester");
    const voter = await ballot.voterRegister(testAddress);
    expect(await voter.voterName).to.be.equal("tester");
    expect(await voter.voted).to.be.equal(false);
    expect(await ballot.totalVoter()).to.be.equal(1);
  });
  it("should failed to do vote if the state is created", async () => {
    const { ballot } = await loadFixture(deployBallotFixture);
    await expect(ballot.doVote(true)).to.be.rejected;
  });
  it("should fail to do vote if voter's address is not asigned", async () => {
    const { ballot } = await loadFixture(deployBallotFixture);
    const [owner, testAccount] = await ethers.getSigners();
    await ballot.startVote();
    expect(await ballot.connect(testAccount).doVote(true));
  });
  it("should success to do vote if voter already asign and is not voted", async () => {
    const { ballot } = await loadFixture(deployBallotFixture);
    const [owner, testAccount] = await ethers.getSigners();
    await ballot.addVoter(testAccount, "tester");
    await ballot.startVote();
    expect(await ballot.connect(testAccount).doVote(true));
    expect(await ballot)
      .to.emit(ballot, "voteDone")
      .withArgs(testAccount);
    expect(await ballot.totalVote()).to.equal(1);
  });
  it("should not end vote if the state of ballot is not voting", async () => {
    const { ballot } = await loadFixture(deployBallotFixture);
    await expect(ballot.endVote()).to.be.rejected;
  });
  it("should end vote if the state of ballot is voting and emit event", async () => {
    const { ballot } = await loadFixture(deployBallotFixture);
    await ballot.startVote();
    await expect(ballot.endVote()).to.be.not.rejected;
    expect(await ballot.state()).to.equal(2);
    const finalResult = await ballot.finalResult();
    expect(await finalResult).to.not.be.null;
    expect(await finalResult).to.not.be.undefined;
    expect(await finalResult).to.equal(0);
    expect(await ballot)
      .to.emit(ballot, "voteEnded")
      .withArgs(finalResult);
  });
});
