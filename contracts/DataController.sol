pragma solidity ^0.4.2;

import "./Repository.sol";

contract DataController is Repository {

    function DataController() public {
        landlord = msg.sender;
    }

    // Public functions open for anyone

    function getBalance() public view returns(uint) {
        balances[msg.sender];
    }

    function getApartment(bytes32 _id) public view returns(bytes32, address, string, uint, uint8, uint) {
        Apartment apartment = apartments[_id];
        return (apartment.id, apartment.tenant, apartment.location, apartment.rentPrice, apartment.rentHikeRate, apartment.rentDate);
    }

    function isApartmentRented(bytes32 _id) public view returns(bool) {
        if (apartments[_id].tenant != 0)
            return true;
        return false;
    }

    function getPaymentHistory() public view returns(bytes32, bytes32, uint) {
        Payment payment = paymentHistory[msg.sender];
        return (payment.id, payment.apartment, payment.amount);
    }

    function depositEther() public payable returns(bool success) {
        require(balances[msg.sender] + msg.value > balances[msg.sender]);
        balances[msg.sender] = msg.value;
        return true;
    }

    // Public functions allowed for Landlord only

    function getHireRequestsForLandlord(bytes32 _apartment) public onlyOwner view returns(bytes32[], address[], uint[], uint8[]) {
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

    function isRequestSent(bytes32 _apartment, address _potentialTenant) public view returns(bool) {
        bytes32[] requestAddresses = hireRequests[_apartment];
        for (uint i = 0; i < requestAddresses.length; i++) {
            if (requestsForLandlord[requestAddresses[i]].from == _potentialTenant)
                return true;
        }
        return false;
    }

    function addApartment(string _location, uint _rentPrice, uint8 _rentHikeRate, uint _rentDate) public onlyOwner returns(bytes32 id) {
        id = sha3(_location);
        apartments[id] = Apartment(id, 123456, 0, _location, _rentPrice, _rentHikeRate, _rentDate);
        return id;
    }

    function approveHireRequest(bytes32 _apartment, address _potentialTenant) public onlyOwner returns (bool success) {
        require(isRequestSent(_apartment, _potentialTenant));

        apartments[_apartment].tenant = _potentialTenant;
        tenantsToApartment[_potentialTenant] = _apartment;

        delete hireRequests[_apartment];
        success = true;
    }

    function rejectAllHireRequest(bytes32 _apartment, address _potentialTenant) public onlyOwner returns (bool success) {
        delete hireRequests[_apartment];
        success = true;
    }

    function hikeRent(bytes32 _apartment) public onlyOwner returns (bool success) {

    }

    // Public functions allowed for current tenants only

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

    function terminateRent(bytes32 _apartment) public onlyTenant returns (bool success) {

    }

    // Public function allowed for potential tenants only

    function hireApartment(bytes32 _apartment, uint _rentPrice, uint8 _rentHikeRate) public onlyPotentialTenant returns(bool success) {
        bytes32 id = sha3(_apartment, msg.sender, _rentPrice, _rentHikeRate);
        Request memory request = Request(id, _apartment, msg.sender, _rentPrice, _rentHikeRate);
        hireRequests[_apartment].push(id);
        requestsForLandlord[id] = request;
        success = true;
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