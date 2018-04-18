pragma solidity ^0.4.2;

import "./Repository.sol";
import "./DateTime.sol";

/*
Data controller smart contract
*/

contract DataController is Repository, DateTime {

    // Data controller constructor
    function DataController() public {
        owner = msg.sender;
    }


    // Events emitted during transactions

    // Event emitted when apartment is added
    event ApartmentAdded(bytes32 apartmentId);
    // Event emitted when apartment is edited
    event ApartmentEdited(bytes32 apartmentId, bytes32 apartmentName);

    // Public functions open for anyone

    // Function used to create a new user
//    function createUser(bytes32 _email, address _wallet, bool _isLandlord) public view returns(bool) {
//        require(isUserUnique(_email));
//        users[_email] = User(_email, _wallet, _isLandlord);
//    }

    // Function used to get the deposited ether balance
    function getBalance() public view returns(uint) {
        return balances[msg.sender];
    }

    // Function used to get the apartment information by ID
    function getApartment(bytes32 _id) public view returns(bytes32, bytes32, address, address, bytes32, uint, uint16) {
        Apartment apartment = apartments[_id];
        return (apartment.id, apartment.name, apartment.owner, apartment.tenant, apartment.location, apartment.rentPrice, apartment.rentHikeRate);
    }

    // Function used to get all apartments available
    function getApartments() public view returns(bytes32[], bytes32[], address[], bytes32[], uint[], uint16[]) {
        bytes32[] memory ids = new bytes32[](apartmentsArr.length);
        bytes32[] memory names = new bytes32[](apartmentsArr.length);
        address[] memory tenants = new address[](apartmentsArr.length);
        bytes32[] memory locations = new bytes32[](apartmentsArr.length);
        uint[] memory rentPrices = new uint[](apartmentsArr.length);
        uint16[] memory rentHikeRates = new uint16[](apartmentsArr.length);

        for (uint i = 0; i < apartmentsArr.length; i++) {
            if (apartmentsArr[i].owner == msg.sender) {
                ids[i] = apartmentsArr[i].id;
                names[i] = apartmentsArr[i].name;
                tenants[i] = apartmentsArr[i].tenant;
                locations[i] = apartmentsArr[i].location;
                rentPrices[i] = apartmentsArr[i].rentPrice / 18;
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

    // Function used to check if the request was sent
    function isRequestSent(bytes32 _apartment, address _potentialTenant) public view returns(bool) {
        Request[] requests = apartmentToRequests[_apartment];
        for (uint i = 0; i < requests.length; i++) {
            if (requests[i].apartment == _apartment && requests[i].from == _potentialTenant) {
                return true;
            }
        }
        return false;
    }

    // Function used to check if the user email address is unique
//    function isUserUnique(bytes32 _email) returns(bool) {
//        if (users[_email].email != _email) {
//            return true;
//        }
//        return false;
//    }


    // Public functions allowed for Landlord only

    // Function used to get all requests of an apartment
    function getHireRequestsOfApartment(bytes32 _apartment) public onlyLandlord(_apartment) view returns(bytes32[], address[]) {
        Request[] requests = apartmentToRequests[_apartment];

        bytes32[] memory ids = new bytes32[](requests.length);
        address[] memory froms = new address[](requests.length);

        for (uint i = 0; i < requests.length; i++) {
            ids[i] = requests[i].id;
            froms[i] = requests[i].from;
        }

        return (ids, froms);
    }

    // Function used to get all requests for a landlord
    function getAllHireRequests() public view returns(bytes32[], address[]) {
        bytes32[] memory ids = new bytes32[](requestsArr.length);
        address[] memory froms = new address[](requestsArr.length);

        for (uint i = 0; i < requestsArr.length; i++) {
            if (requestsArr[i].to ==  msg.sender) {
                ids[i] = requestsArr[i].id;
                froms[i] = requestsArr[i].from;
            }
        }

        return (ids, froms);
    }

    // Function used to add apartment by the landlord
    function addApartment(bytes32 _name, bytes32 _location, uint _rentPrice, uint8 _rentHikeRate) public returns(bytes32 id) {
        id = sha3(_location);
        Apartment memory apartment = Apartment(id, 123456, apartmentsArr.length, _name, msg.sender, address(0), _location, _rentPrice * 18, _rentHikeRate, Date(0, 0, 0));
        apartments[id] = apartment;
        apartmentsArr.push(apartment);
        ApartmentAdded(id);
        return id;
    }

    // Function used to edit apartment by the landlord
    function editApartment(bytes32 _id, bytes32 _name, bytes32 _location, uint _rentPrice, uint8 _rentHikeRate) public onlyLandlord(_id) returns(bool success) {
        apartments[_id].name = _name;
        apartments[_id].location = _location;
        apartments[_id].rentPrice = _rentPrice;
        apartments[_id].rentHikeRate = _rentHikeRate;

        apartmentsArr[apartments[_id].index].name = _name;
        apartmentsArr[apartments[_id].index].location = _location;
        apartmentsArr[apartments[_id].index].rentPrice = _rentPrice;
        apartmentsArr[apartments[_id].index].rentHikeRate = _rentHikeRate;

        ApartmentEdited(apartments[_id].id, apartments[_id].name);
    }

    // Function used to approve hire request by tenant
    function approveHireRequest(bytes32 _request, bytes32 _apartment, address _potentialTenant) public onlyLandlord(_apartment) returns (bool success) {
        require(isRequestSent(_apartment, _potentialTenant));

        var (month, year) = getNextMonthDate(getYear(now), getMonth(now));
        uint8 day = getDay(now);

        Date memory nextRentDate = Date(year, month, day);

        apartments[_apartment].tenant = _potentialTenant;
        apartments[_apartment].nextRentDate = nextRentDate;

        apartmentsArr[apartments[_apartment].index].tenant = _potentialTenant;
        apartmentsArr[apartments[_apartment].index].nextRentDate = nextRentDate;

        tenantsToApartment[_potentialTenant] = _apartment;
        tenantToOwner[_potentialTenant] = msg.sender;

        delete hireRequests[_request];
        delete apartmentToRequests[_apartment];
        success = true;
    }

    // Function used to reject all hire requests
    function rejectAllHireRequests(bytes32 _request, bytes32 _apartment) public onlyLandlord(_apartment) returns (bool success) {
        delete hireRequests[_request];
        delete apartmentToRequests[_apartment];
        success = true;
    }

    // Function used to collect rent
    function collectRent(bytes32 _apartment) returns (bool success) {
        Apartment apartment = apartments[_apartment];
        uint rentPrice = apartment.rentPrice * (apartment.rentHikeRate / 100 + 1);
        address tenant = apartment.tenant;
        if (toTimestamp(apartment.nextRentDate.year, apartment.nextRentDate.month, apartment.nextRentDate.day) >= now) {
            require(balances[tenant] >= rentPrice);
            require(balances[tenant] - rentPrice < balances[tenant]);
            require(msg.sender.balance + rentPrice > balances[tenant]);

            balances[tenant] -= rentPrice;
            msg.sender.transfer(rentPrice);

            var (month, year) = getNextMonthDate(getYear(now), getMonth(now));
            uint8 day = getDay(now);
            Date memory nextRentDate = Date(year, month, day);

            apartments[_apartment].nextRentDate = nextRentDate;
            apartments[_apartment].rentPrice = rentPrice;
            apartmentsArr[apartments[_apartment].index].nextRentDate = nextRentDate;
            apartmentsArr[apartments[_apartment].index].rentPrice = rentPrice;

            bytes32 paymentId = sha3(_apartment, msg.sender, tenant);
            paymentHistory[tenant].push(Payment(paymentId, _apartment, msg.sender, rentPrice, now));

            return true;
        }
        return false;
    }


    // Public functions allowed for current tenants only

    // Function used to deposit ether to smart contract which is held in escrow
    function makePayment() public payable returns(bool success) {
        require(balances[msg.sender] + msg.value > balances[msg.sender]);
        balances[msg.sender] += msg.value;
        return true;
    }

    // Function used to get payment history of an apartment by tenant
    function getPaymentHistory(bytes32 _apartment) public onlyTenant returns(address[], uint[], uint[]) {
        Payment[] payments = paymentHistory[msg.sender];

        address[] memory tos = new address[](payments.length);
        uint[] memory amounts = new uint[](payments.length);
        uint[] memory dates = new uint[](payments.length);

        for (uint i = 0; i < payments.length; i++) {
            if (payments[i].apartment == _apartment) {
                tos[i] = payments[i].to;
                amounts[i] = payments[i].amount;
                dates[i] = payments[i].date;
            }
        }

        return(tos, amounts, dates);
    }

    // Function used to get the apartment information by ID
    function getHiredApartment(bytes32 _id) public onlyTenant view returns(bytes32, bytes32, address, address, bytes32, uint, uint16) {
        Apartment apartment = apartments[_id];
        require(apartment.tenant == msg.sender);
        return (apartment.id, apartment.name, apartment.owner, apartment.tenant, apartment.location, apartment.rentPrice, apartment.rentHikeRate);
    }

    // Public function allowed for potential tenants only

    // Function used to send hire request to landlord
    function hireApartment(bytes32 _apartment, address _to) public onlyPotentialTenant returns(bool success) {
        bytes32 id = sha3(_apartment, _to, msg.sender);
        Request memory request = Request(id, _apartment, _to, msg.sender);
        hireRequests[id] = request;
        apartmentToRequests[_apartment].push(request);
        requestsArr.push(request);
        success = true;
    }

    // Utility functions

    function _stringToBytes32(string memory source) returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }

    // Modifiers

    modifier onlyLandlord(bytes32 _apartment) {
        require(apartments[_apartment].owner == msg.sender);
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