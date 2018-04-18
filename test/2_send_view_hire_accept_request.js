var dataController = artifacts.require("./DataController.sol");

contract('Data Controller', function (accounts) {
    var apartmentId = "0x6a5f4cf66950ca88022e42abd83eeb60eff1737d88db5dbb53e651dbf9bc19b7"
    var requestId
    it("should be possible to send request", function () {
        var instance;
        return dataController.deployed().then(function (i) {
            instance = i;
            return instance.hireApartment(apartmentId, accounts[0], { from: accounts[1] });
        }).then(function (txResult) {
            assert.equal(txResult.logs[0].event, "HireRequestReceived", "The Log-Event should be HireRequestReceived");
            requestId = txResult.logs[0].args.requestId
        })
    });

    it("should be possible to view request", function () {
        var instance;
        return dataController.deployed().then(function (i) {
            instance = i;
            return instance.getAllHireRequests.call({ from: accounts[0] });
        }).then(function (result) {
            assert.equal(result[0], requestId, "Request not showing")
        })
    });

//    it("should be possible to accept request", function () {
//        var instance;
//        return dataController.deployed().then(function (i) {
//            instance = i;
//            return instance.approveHireRequest(requestId, apartmentId, accounts[1], { from: accounts[0] });
//        }).then(function (txResult) {
//            assert.equal(txResult.logs[0].event, "HireRequestApproved", "The Log-Event should be HireRequestReceived");
//            assert.equal(requestId, txResult.logs[0].args.requestId, "The Log-Event should be HireRequestReceived");
//        })
//    });
});