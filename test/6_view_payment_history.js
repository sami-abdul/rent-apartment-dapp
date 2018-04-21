/**
* Unit tests for viewing of payment history by tenant
*/

var dataController = artifacts.require("./DataController.sol");

contract('Data Controller', function (accounts) {
    var requestId
    var apartmentId = ""

    it("", function () {
        var instance;
        return dataController.deployed().then(function (i) {
            instance = i;
            return instance.addApartment("name", "location", web3.toWei(5, 'ether'), 5, { from: accounts[0] });
        }).then(function (txResult) {
            assert.equal(txResult.logs[0].event, "ApartmentAdded", "The Log-Event should be ApartmentAdded");
            apartmentId = txResult.logs[0].args.apartmentId
        })
    });

    it("", function () {
        var instance;
        return dataController.deployed().then(function (i) {
            instance = i;
            return instance.hireApartment(apartmentId, accounts[0], { from: accounts[1] });
        }).then(function (txResult) {
            assert.equal(txResult.logs[0].event, "HireRequestReceived", "The Log-Event should be HireRequestReceived");
            requestId = txResult.logs[0].args.requestId
        })
    });

    it("", function () {
        var instance;
        return dataController.deployed().then(function (i) {
            instance = i;
            return instance.approveHireRequest(requestId, apartmentId, accounts[1], { from: accounts[0] });
        }).then(function (txResult) {
            assert.equal(txResult.logs[0].event, "HireRequestApproved", "The Log-Event should be HireRequestReceived");
            assert.equal(requestId, txResult.logs[0].args.requestId, "Request IDs are not same");
        })
    });

    it("", function () {
            var instance;
            var balanceBeforeTransaction = web3.eth.getBalance(accounts[1]);
            var balanceAfterDeposit;
            var gasUsed = 0;

            return dataController.deployed().then(function (i) {
                instance = i;
                return instance.makePayment({from: accounts[1], value: web3.toWei(10, "ether")});
            }).then(function (txHash) {
                gasUsed += txHash.receipt.cumulativeGasUsed * web3.eth.getTransaction(txHash.receipt.transactionHash).gasPrice.toNumber(); //here we have a problem
                balanceAfterDeposit = web3.eth.getBalance(accounts[1]);
                return instance.getBalance.call({ from: accounts[1] });
            }).then(function (balanceInWei) {
            })
        });

    it("", function () {
        var instance;
        var balanceBeforeTransaction = web3.eth.getBalance(accounts[0]);
        var gasUsed = 0;

        return dataController.deployed().then(function (i) {
            instance = i;
            return instance.collectRent(apartmentId, {from: accounts[0] });
        }).then(function (txResult) {
            assert.equal(txResult.logs[0].event, "RentCollected", "The Log-Event should be RentCollected");
        })
    });

    it("should be possible to view payment history", function () {
            var instance;

            return dataController.deployed().then(function (i) {
                instance = i;
                return instance.getPaymentHistory(apartmentId, {from: accounts[1] });
            }).then(function (txResult) {
                assert.equal(txResult[0], accounts[0], "Payment not saved")
            })
        });
});