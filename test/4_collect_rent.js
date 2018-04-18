//var dataController = artifacts.require("./DataController.sol");
//
//contract('Data Controller', function (accounts) {
//    var apartmentId = "0x6a5f4cf66950ca88022e42abd83eeb60eff1737d88db5dbb53e651dbf9bc19b7"
//
//    it("should be possible to collect rent for apartment", function () {
//        var instance;
//        var balanceBeforeTransaction = web3.eth.getBalance(accounts[1]);
//        var gasUsed = 0;
//
//        return dataController.deployed().then(function (i) {
//            instance = i;
//            return instance.collectRent(apartmentId, {from: accounts[1] });
//        }).then(function (txResult) {
//            console.log(txResult)
//            return instance.getBalance.call();
//        }).then(function (balanceInWei) {
//            console.log(balanceInWei)
//        })
//    });
//});