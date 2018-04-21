/**
* Unit tests for collection of rent by landlord
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

    it("should be possible to collect rent for apartment", function () {
        var instance;
        var balanceBeforeTransaction = web3.eth.getBalance(accounts[0]);
        var tempData = null
        const factor = 100000000000000;

        return dataController.deployed().then(function (i) {
            instance = i;
            return instance.getApartment.call(apartmentId, { from: accounts[0] })
        }).then(function (result) {
            tempData = result;
            var rent = web3.fromWei(tempData[5].c[0] * factor, 'ether') * (tempData[6].c[0] / 100 + 1)
            return instance.collectRent(apartmentId, rent, {from: accounts[0] });
        }).then(function(txResult) {
            assert.equal(txResult.logs[0].event, "RentCollected", "The Log-Event should be RentCollected");
            console.log(txResult.logs[0].args.amount.toNumber())
        })
    });

    it("rent should be paid now", function () {
        var instance;

        return dataController.deployed().then(function (i) {
            instance = i;
            return instance.isRentPaid.call({ from: accounts[1] })
        }).then(function (result) {
            console.log("Rent: " + result)
        })
    });
});