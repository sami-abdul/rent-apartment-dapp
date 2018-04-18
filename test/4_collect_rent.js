var dataController = artifacts.require("./DataController.sol");

contract('Data Controller', function (accounts) {
    var requestId
    var apartmentId = ""

    it("", function () {
        var instance;
        return dataController.deployed().then(function (i) {
            instance = i;
            return instance.addApartment("name", "location", 1, 5, { from: accounts[0] });
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
            var balanceBeforeTransaction = web3.eth.getBalance(accounts[0]);
            var balanceAfterDeposit;
            var gasUsed = 0;

            return dataController.deployed().then(function (i) {
                instance = i;
                return instance.makePayment({from: accounts[0], value: web3.toWei(10, "ether")});
            }).then(function (txHash) {
                gasUsed += txHash.receipt.cumulativeGasUsed * web3.eth.getTransaction(txHash.receipt.transactionHash).gasPrice.toNumber(); //here we have a problem
                balanceAfterDeposit = web3.eth.getBalance(accounts[0]);
                return instance.getBalance.call();
            }).then(function (balanceInWei) {
                assert.equal(balanceInWei.toNumber(), web3.toWei(10, "ether"), "There is ten ether available");
                assert.isAtLeast(balanceBeforeTransaction.toNumber() - balanceAfterDeposit.toNumber(), web3.toWei(10, "ether"),  "Balances of account are the same");
            })
        });

    it("should be possible to collect rent for apartment", function () {
        var instance;
        var balanceBeforeTransaction = web3.eth.getBalance(accounts[0]);
        var gasUsed = 0;

        return dataController.deployed().then(function (i) {
            instance = i;
            return instance.collectRent(apartmentId, {from: accounts[0] });
        }).then(function (txResult) {
            console.log(txResult.logs[0])
//            assert.equal(txResult.logs[0].event, "RentCollected", "The Log-Event should be RentCollected");

//            console.log(txResult.logs[0].args.todaysDate)
//            console.log(txResult.logs[0].args.nextRentDate)

            console.log("Bal after: " +balanceBeforeTransaction)
            console.log("Bal before: " + web3.eth.getBalance(accounts[0]))
        })
    });
});