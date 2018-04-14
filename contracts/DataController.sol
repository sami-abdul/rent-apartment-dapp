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

    function getApartment(address _id) public view returns(address, address, string, uint, uint8, uint) {
        Apartment apartment = apartments[_id];
        return (apartment.id, apartment.tenant, apartment.location, apartment.rentPrice, apartment.rentHikeRate, apartment.rentDate);
    }

    function isApartmentRented(address _id) public view returns(bool) {
        if (apartments[_id].tenant != 0)
            return true;
        return false;
    }

    function getPaymentHistory() public view returns(address, address, uint) {
        Payment payment = paymentHistory[msg.sender];
        return (payment.id, payment.apartment, payment.amount);
    }

    function depositEther() public payable returns(bool success) {
        require(balances[msg.sender] + msg.value > balances[msg.sender]);
        balances[msg.sender] = msg.value;
        return true;
    }

    // Public functions allowed for Landlord only

    function getHireRequestsForLandlord(address _id) public onlyOwner view returns(address[], address[], address[], uint[], uint8[]) {
        Request request = requestsForLandlord[hireRequests[_id]];
        return (request.from, request.rentPrice, request.rentHikeRate);
    }

    function isRequestSent(address _apartment, address _potentialTenant) public view returns(bool) {
        address[] requestAddresses = hireRequests[_apartment];
        for (uint i = 0; i < requestAddresses.length; i++) {
            if (requestsForLandlord[requestAddresses[i]].from == _potentialTenant)
                return true;
        }
        return false;
    }

    function addApartment(string _location, uint _rentPrice, uint8 _rentHikeRate, uint _rentDate) public onlyOwner returns(address id) {
        id = sha3(_location);
        apartments[id] = Apartment(id, 123456, 0, _location, _rentPrice, _rentHikeRate, _rentDate);
        return id;
    }

    function approveHireRequest(address _apartment, address _potentialTenant) public onlyOwner returns (bool success) {
        require(isRequestSent(_apartment, _potentialTenant));

        apartments[_apartment].tenant = _potentialTenant;
        tenantsToApartment[_potentialTenant] = _apartment;

        delete hireRequests[_apartment];
        success = true;
    }

    function rejectAllHireRequest(address _apartment, address _potentialTenant) public onlyOwner returns (bool success) {
        delete hireRequests[_apartment];
        success = true;
    }

    function hikeRent(address _apartment) public onlyOwner returns (bool success) {

    }

    // Public functions allowed for current tenants only

    function payRent() public onlyTenant returns(uint16 key) {
        Apartment apartment = apartments[tenantsToApartment[msg.sender]];
        uint rentPrice = apartment.rentPrice;

        require(balances[msg.sender] >= rentPrice);
        require(balances[msg.sender] - rentPrice < balances[msg.sender]);
        require(balances[landlord] + rentPrice > balances[msg.sender]);

        balances[msg.sender] - rentPrice;
        balances[landlord] + rentPrice;

        address paymentId = sha3(apartment.id, rentPrice, now);
        paymentHistory[msg.sender] = Payment(paymentId, apartment.id, rentPrice, now);

        key = 123456;
    }

    function terminateRent(address _apartment) public onlyTenant returns (bool success) {

    }

    // Public function allowed for potential tenants only

    function hireApartment(address _apartment, uint _rentPrice, uint8 _rentHikeRate) public onlyPotentialTenant returns(bool success) {
        address id = sha3(_apartment, msg.sender, _rentPrice, _rentHikeRate);
        Request request = Request(id, _apartment, msg.sender, _rentPrice, _rentHikeRate);
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