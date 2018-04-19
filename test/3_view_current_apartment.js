/**
* Unit tests for viewing of current apartment by tenant
*/

var dataController = artifacts.require("./DataController.sol");

contract('Data Controller', function (accounts) {
    var requestId
    var apartmentId = ""

    it("", function () {
        var instance;
        return dataController.deployed().then(function (i) {
            instance = i;
            return instance.addApartment("name", "location", 10, 5, { from: accounts[0] });
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

    it("should show current apartment", function () {
        var instance;
        return dataController.deployed().then(function (i) {
            instance = i;
            return instance.getCurrentApartment({ from: accounts[1] });
        }).then(function (txResult) {
            assert.equal(txResult[0], apartmentId, "Apartment no rented")
        })
    });
});