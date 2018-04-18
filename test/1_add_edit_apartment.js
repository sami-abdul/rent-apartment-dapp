var dataController = artifacts.require("./DataController.sol");

contract('Data Controller', function (accounts) {
    var apartmentId = ""
    it("should be possible to add apartment", function () {
        var instance;
        return dataController.deployed().then(function (i) {
            instance = i;
            return instance.addApartment("name", "location", 1, 5, { from: accounts[0] });
        }).then(function (txResult) {
            assert.equal(txResult.logs[0].event, "ApartmentAdded", "The Log-Event should be ApartmentAdded");
            apartmentId = txResult.logs[0].args.apartmentId
        })
    });

    it("should be possible to edit apartment", function () {
        var instance;
        return dataController.deployed().then(function (i) {
            instance = i;
            return instance.editApartment(apartmentId, "names", "location", 1, 5, { from: accounts[0] });
        }).then(function (txResult) {
            assert.equal(txResult.logs[0].event, "ApartmentEdited", "The Log-Event should be ApartmentEdited");
            assert.equal(txResult.logs[0].args.apartmentName, "0x6e616d6573000000000000000000000000000000000000000000000000000000", "The Log-Event should be ApartmentEdited");
        })
    });
});