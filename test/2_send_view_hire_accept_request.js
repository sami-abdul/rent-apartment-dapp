///**
//* Unit tests for sending hire request by tenant and viewing and accepting by landlord
//*/
//
//var dataController = artifacts.require("./DataController.sol");
//
//contract('Data Controller', function (accounts) {
//    var requestId
//    var apartmentId = ""
//
//    it("", function () {
//        var instance;
//        return dataController.deployed().then(function (i) {
//            instance = i;
//            return instance.addApartment("name", "location", 10, 5, { from: accounts[0] });
//        }).then(function (txResult) {
//            assert.equal(txResult.logs[0].event, "ApartmentAdded", "The Log-Event should be ApartmentAdded");
//            apartmentId = txResult.logs[0].args.apartmentId
//        })
//    });
//
//    it("should be possible to send request", function () {
//        var instance;
//        return dataController.deployed().then(function (i) {
//            instance = i;
//            return instance.hireApartment(apartmentId, accounts[0], { from: accounts[1] });
//        }).then(function (txResult) {
//            assert.equal(txResult.logs[0].event, "HireRequestReceived", "The Log-Event should be HireRequestReceived");
//            requestId = txResult.logs[0].args.requestId
//        })
//    });
//
//    it("should be possible to view request", function () {
//        var instance;
//        return dataController.deployed().then(function (i) {
//            instance = i;
//            return instance.getAllHireRequests.call({ from: accounts[0] });
//        }).then(function (result) {
//            assert.equal(result[0], requestId, "Request not showing")
//        })
//    });
//
//    it("should be possible to accept request", function () {
//        var instance;
//        return dataController.deployed().then(function (i) {
//            instance = i;
//            return instance.approveHireRequest(requestId, apartmentId, accounts[1], { from: accounts[0] });
//        }).then(function (txResult) {
//            assert.equal(txResult.logs[0].event, "HireRequestApproved", "The Log-Event should be HireRequestReceived");
//            assert.equal(requestId, txResult.logs[0].args.requestId, "Request IDs are not same");
//        })
//    });
//
//    it("Apartment should now be rented", function () {
//        var instance;
//        return dataController.deployed().then(function (i) {
//            instance = i;
//            return instance.getApartment(apartmentId, { from: accounts[1] });
//        }).then(function (txResult) {
//            assert.equal(txResult[3], accounts[1], "Apartment not rented");
//        })
//    });
//});