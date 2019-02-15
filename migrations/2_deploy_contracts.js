var SmartLendingLibrary = artifacts.require("SmartLendingLibrary");

module.exports = function(deployer) {
  deployer.deploy(SmartLendingLibrary);
};