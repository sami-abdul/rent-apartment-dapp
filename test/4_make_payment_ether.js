/**
* Unit tests for making rent payment in ether by tenant
*/

var dataController = artifacts.require("./DataController.sol");

contract('Data Controller', function (accounts) {
    it("should be possible to make payment for apartment rent", function () {
        var instance;
        var balanceBeforeTransaction = web3.eth.getBalance(accounts[0]);
        var balanceAfterDeposit;
        var gasUsed = 0;

        return dataController.deployed().then(function (i) {
            instance = i;
            return instance.makePayment({from: accounts[0], value: web3.toWei(1, "ether")});
        }).then(function (txHash) {
            gasUsed += txHash.receipt.cumulativeGasUsed * web3.eth.getTransaction(txHash.receipt.transactionHash).gasPrice.toNumber(); //here we have a problem
            balanceAfterDeposit = web3.eth.getBalance(accounts[0]);
            return instance.getBalance.call();
        }).then(function (balanceInWei) {
//            assert.equal(txResult.logs[0].event, "RentPaid", "The Log-Event should be RentPaid");
        })
    });
});
