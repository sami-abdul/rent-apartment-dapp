pragma solidity ^0.4.2;

import "./Repository.sol";

/*
    Data controller smart contract
*/

contract DataController is Repository {

    // Data controller constructor
    function DataController() public {
        owner = msg.sender;
    }

    // Public functions open for anyone

    // Function used to get the deposited ether balance
    function getBalance() public view returns(uint) {
        escrowBalances[msg.sender];
    }

    // Function used to get the apartment information by ID
    function getApartment(bytes32 _id) public view returns(bytes32, bytes32, address, address, bytes32, uint, uint8) {
        Apartment apartment = apartments[_id];
        return (apartment.id, apartment.name, apartment.owner, apartment.tenant, apartment.location, apartment.rentPrice, apartment.rentHikeRate);
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
            if (apartmentsArr[i].owner == msg.sender) {
                ids[i] = apartmentsArr[i].id;
                names[i] = apartmentsArr[i].name;
                tenants[i] = apartmentsArr[i].tenant;
                locations[i] = apartmentsArr[i].location;
                rentPrices[i] = apartmentsArr[i].rentPrice;
                rentHikeRates[i] = apartmentsArr[i].rentHikeRate;
            }
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
    function depositEtherInEscrow() public payable returns(bool success) {
        require(escrowBalances[msg.sender] + msg.value > escrowBalances[msg.sender]);
        escrowBalances[msg.sender] = msg.value;
        return true;
    }

    // Function used to check if the request was sent
    function isRequestSent(bytes32 _apartment, bytes32 _potentialTenant) public view returns(bool) {
        Request[] requests = apartmentToRequests[_apartment];
        for (uint i = 0; i < requests.length; i++) {
            if (requests[i].apartment == _apartment && requests[i].from == _potentialTenant) {
                return true;
            }
        }
        return false;
    }

    // Public functions allowed for Landlord only

    // Function used to get all requests of an apartment
    function getHireRequestsOfApartment(bytes32 _apartment) public onlyLandlord(_apartment) view returns(bytes32[], address[]) {
        Request[] requests = apartmentToRequests[_apartment];

        bytes32[] memory ids = new bytes32[](requestAddresses.length);
        address[] memory froms = new address[](requestAddresses.length);

        for (uint i = 0; i < requests.length; i++) {
            ids[i] = requests[i].id;
            froms[i] = requests[i].from;
        }

        return (ids, froms);
    }

    function getAllHireRequests() public view returns(bytes32[], address[]) {
        Request[] requests = hireRequests[_apartment];

        bytes32[] memory ids = new bytes32[](requestAddresses.length);
        address[] memory froms = new address[](requestAddresses.length);

        for (uint i = 0; i < requests.length; i++) {
            if (requests[i].to ==  msg.sender) {
                ids[i] = request.id;
                froms[i] = request.from;
            }
        }

        return (ids, froms);
    }

    // Function used to add apartment by the landlord
    function addApartment(bytes32 _name, bytes32 _location, uint _rentPrice, uint8 _rentHikeRate) public returns(bytes32 id) {
        id = sha3(_location);
        Apartment memory apartment = Apartment(id, 123456, _name, msg.sender, address(0), _location, _rentPrice, _rentHikeRate, 0);
        apartments[id] = apartment;
        apartmentsArr.push(apartment);
        return id;
    }

    // Function used to edit apartment by the landlord
    function editApartment(bytes32 _id, bytes32 _name, bytes32 _location, uint _rentPrice, uint8 _rentHikeRate) public public onlyLandlord(_id) returns(bool success) {
        apartments[_id].name = _name;
        apartments[_id].location = _location;
        apartments[_id].rentPrice = _rentPrice;
        apartments[_id].rentHikeRate = _rentHikeRate;
    }

    // Function used to approve hire request by tenant
    function approveHireRequest(bytes32 _request, bytes32 _apartment, address _potentialTenant) public public onlyLandlord(_apartment) returns (bool success) {
        require(isRequestSent(_apartment, _potentialTenant));

        apartments[_apartment].tenant = _potentialTenant;
        tenantsToApartment[_potentialTenant] = _apartment;

        delete hireRequests[_request];
        delete apartmentToRequests[_apartment];
        success = true;
    }

    // Function used to reject all hire requests
    function rejectAllHireRequests(bytes32 _request, bytes32 _apartment) public public onlyLandlord(_apartment) returns (bool success) {
        delete hireRequests[_request];
        delete apartmentToRequests[_apartment];
        success = true;
    }

    function hikeRent(bytes32 _apartment) public public onlyLandlord(_apartment) returns (bool success) {

    }

    // Public functions allowed for current tenants only

    // Function used to pay rent to the landlord by tenant
    function payRent() public onlyTenant returns(uint key) {
        Apartment apartment = apartments[tenantsToApartment[msg.sender]];
        uint rentPrice = apartment.rentPrice;

        require(escrowBalances[msg.sender] >= rentPrice);
        require(escrowBalances[msg.sender] - rentPrice < escrowBalances[msg.sender]);
        require(escrowBalances[owner] + rentPrice > escrowBalances[msg.sender]);

        escrowBalances[msg.sender] - rentPrice;
        escrowBalances[owner] + rentPrice;

        bytes32 paymentId = sha3(apartment.id, rentPrice, now);
        paymentHistory[msg.sender] = Payment(paymentId, apartment.id, rentPrice, now);

        key = 123456;
    }

    // Function used to terminate the rent contract
    function terminateRent(bytes32 _apartment) public onlyTenant returns (bool success) {

    }

    // Public function allowed for potential tenants only

    // Function used to send hire request to landlord
    function hireApartment(bytes32 _apartment, address _to) public onlyPotentialTenant returns(bool success) {
        bytes32 id = sha3(_apartment, _to, msg.sender);
        Request memory request = Request(id, _apartment, _to, msg.sender);
        hireRequests[id] = request;
        apartmentToRequests[_apartment].push(request);
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

    modifier onlyLandlord(bytes32 _apartment) {
        require(apartments[_apartment] == msg.sender);
        _;
    }

    modifier onlyPotentialTenant() {
        require(owner != msg.sender);
        require(tenantsToApartment[msg.sender] == 0);
        _;
    }

    modifier onlyTenant() {
        require (tenantsToApartment[msg.sender] != 0);
        _;
    }
}