pragma solidity ^0.4.2;

import "./Repository.sol";

/*
    Data controller smart contract
*/

contract DataController is Repository {

    // Data controller constructor
    function DataController() public {
        landlord = msg.sender;
    }

    // Public functions open for anyone

    // Function used to get the deposited ether balance
    function getBalance() public view returns(uint) {
        balances[msg.sender];
    }

    // Function used to get the apartment information by ID
    function getApartment(bytes32 _id) public view returns(bytes32, bytes32, address, bytes32, uint, uint8) {
        Apartment apartment = apartments[_id];
        return (apartment.id, apartment.name, apartment.tenant, apartment.location, apartment.rentPrice, apartment.rentHikeRate);
    }

    // Function used to get all apartments available
    function getApartments() public view returns(bytes32[], bytes32[], address[], bytes32[], uint[], uint8[]) {
        bytes32[] memory ids = new bytes32[](apartmentsArr.length);
        bytes32[] memory names = new bytes32[](apartmentsArr.length);
        address[] memory tenants = new address[](apartmentsArr.length);
        bytes32[] memory locations = new bytes32[](apartmentsArr.length);
        uint[] memory rentPrices = new uint[](apartmentsArr.length);
        uint8[] memory rentHikeRates = new uint8[](apartmentsArr.length);

        for (uint i = 0; i < apartmentsArr.length; i++) {
            ids[i] = apartmentsArr[i].id;
            names[i] = apartmentsArr[i].name;
            tenants[i] = apartmentsArr[i].tenant;
            locations[i] = apartmentsArr[i].location;
            rentPrices[i] = apartmentsArr[i].rentPrice;
            rentHikeRates[i] = apartmentsArr[i].rentHikeRate;
        }

        return (ids, names, tenants, locations, rentPrices, rentHikeRates);
    }

    // Function used to return the status of the apartment
    function isApartmentRented(bytes32 _id) public view returns(bool) {
        if (apartments[_id].tenant != 0)
            return true;
        return false;
    }

    // Function used to get the payment history
    function getPaymentHistory() public view returns(bytes32, bytes32, uint) {
        Payment payment = paymentHistory[msg.sender];
        return (payment.id, payment.apartment, payment.amount);
    }

    // Function used to deposit ether to smart contract
    function depositEther() public payable returns(bool success) {
        require(balances[msg.sender] + msg.value > balances[msg.sender]);
        balances[msg.sender] = msg.value;
        return true;
    }

    // Public functions allowed for Landlord only

    // Function used to get all requests of an apartment
    function getHireRequests(bytes32 _apartment) public onlyOwner view returns(bytes32[], address[], uint[], uint8[]) {
        bytes32[] requestAddresses = hireRequests[_apartment];

        bytes32[] memory ids = new bytes32[](requestAddresses.length);
        address[] memory froms = new address[](requestAddresses.length);
        uint[] memory rentPrices = new uint[](requestAddresses.length);
        uint8[] memory rentHikeRates = new uint8[](requestAddresses.length);

        for (uint i = 0; i < requestAddresses.length; i++) {
            Request request = requestsForLandlord[requestAddresses[i]];
            ids[i] = request.id;
            froms[i] = request.from;
            rentPrices[i] = request.rentPrice;
            rentHikeRates[i] = request.rentHikeRate;
        }

        return (ids, froms, rentPrices, rentHikeRates);
    }

    // Function used to check if the request was sent
    function isRequestSent(bytes32 _apartment, address _potentialTenant) public view returns(bool) {
        bytes32[] requestAddresses = hireRequests[_apartment];
        for (uint i = 0; i < requestAddresses.length; i++) {
            if (requestsForLandlord[requestAddresses[i]].from == _potentialTenant)
                return true;
        }
        return false;
    }

    // Function used to add apartment by the landlord
    function addApartment(bytes32 _name, bytes32 _location, uint _rentPrice, uint8 _rentHikeRate) public onlyOwner returns(bytes32 id) {
        id = sha3(_location);
        Apartment memory apartment = Apartment(id, 123456, _name, address(0), _location, _rentPrice, _rentHikeRate, 0);
        apartments[id] = apartment;
        apartmentsArr.push(apartment);
        return id;
    }

    // Function used to approve hire request by tenant
    function approveHireRequest(bytes32 _apartment, address _potentialTenant) public onlyOwner returns (bool success) {
        require(isRequestSent(_apartment, _potentialTenant));

        apartments[_apartment].tenant = _potentialTenant;
        tenantsToApartment[_potentialTenant] = _apartment;

        delete hireRequests[_apartment];
        success = true;
    }

    // Function used to reject hire request by tenant
    function rejectAllHireRequest(bytes32 _apartment, address _potentialTenant) public onlyOwner returns (bool success) {
        delete hireRequests[_apartment];
        success = true;
    }

    function hikeRent(bytes32 _apartment) public onlyOwner returns (bool success) {

    }

    // Public functions allowed for current tenants only

    // Function used to pay rent to the landlord by tenant
    function payRent() public onlyTenant returns(uint key) {
        Apartment apartment = apartments[tenantsToApartment[msg.sender]];
        uint rentPrice = apartment.rentPrice;

        require(balances[msg.sender] >= rentPrice);
        require(balances[msg.sender] - rentPrice < balances[msg.sender]);
        require(balances[landlord] + rentPrice > balances[msg.sender]);

        balances[msg.sender] - rentPrice;
        balances[landlord] + rentPrice;

        bytes32 paymentId = sha3(apartment.id, rentPrice, now);
        paymentHistory[msg.sender] = Payment(paymentId, apartment.id, rentPrice, now);

        key = 123456;
    }

    // Function used to terminate the rent contract
    function terminateRent(bytes32 _apartment) public onlyTenant returns (bool success) {

    }

    // Public function allowed for potential tenants only

    // Function used to send hire request to landlord
    function hireApartment(bytes32 _apartment, uint _rentPrice, uint8 _rentHikeRate) public onlyPotentialTenant returns(bool success) {
        bytes32 id = sha3(_apartment, msg.sender, _rentPrice, _rentHikeRate);
        Request memory request = Request(id, _apartment, msg.sender, _rentPrice, _rentHikeRate);
        hireRequests[_apartment].push(id);
        requestsForLandlord[id] = request;
        success = true;
    }

    function _stringToBytes32(string memory source) returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }

    modifier onlyPotentialTenant() {
        require(landlord != msg.sender);
        require(tenantsToApartment[msg.sender] == 0);
        _;
    }

    modifier onlyTenant() {
        require (tenantsToApartment[msg.sender] != 0);
        _;
    }
}