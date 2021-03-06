pragma solidity 0.5.0;

import "./Repository.sol";
import "./DateTime.sol";

/*
* Data controller smart contract
*/

contract DataController is Repository, DateTime {

    /**
     * Events emitted during transactions
     */

    // Event emitted when apartment is added
    event ApartmentAdded(bytes32 apartmentId);
    // Event emitted when apartment is edited
    event ApartmentEdited(bytes32 apartmentId, bytes32 apartmentName);
    // Event emitted when hire request is received
    event HireRequestReceived(bytes32 requestId, bytes32 apartmentId, address to, address from);
    // Event emitted when hire request is received
    event HireRequestApproved(bytes32 requestId, bytes32 apartmentId, address tenant);
    // Event emitted when hire request is received
    event RentCollected(bytes32 apartment, address tenant, address owner, uint amount);
    // Event emitted when hire rent is paid
    event RentPaid(address tenant, uint amount);

    /**
     * Public functions open for anyone
     */

    // Function used to get the deposited ether balance
    function getBalance() public view returns(uint) {
        return balances[msg.sender];
    }

    // Function used to get the apartment information by ID
    function getApartment(bytes32 _id) public view returns(bytes32, bytes32, address, address, bytes32, uint, uint16) {
        Apartment storage apartment = apartments[_id];
        return (apartment.id, apartment.name, apartment.owner, apartment.tenant, apartment.location, apartment.rentPrice, apartment.rentHikeRate);
    }

    // Function used to get all apartments of a landlord
    function getApartments() public view returns(bytes32[] memory, bytes32[] memory, address[] memory, bytes32[] memory, uint[] memory, uint16[] memory, bool[] memory) {
        bytes32[] memory ids = new bytes32[](apartmentsArr.length);
        bytes32[] memory names = new bytes32[](apartmentsArr.length);
        address[] memory tenants = new address[](apartmentsArr.length);
        bytes32[] memory locations = new bytes32[](apartmentsArr.length);
        uint[] memory rentPrices = new uint[](apartmentsArr.length);
        uint16[] memory rentHikeRates = new uint16[](apartmentsArr.length);
        bool[] memory rentStatuses = new bool[](apartmentsArr.length);

        for (uint i = 0; i < apartmentsArr.length; i++) {
            if (apartmentsArr[i].owner == msg.sender) {
                ids[i] = apartmentsArr[i].id;
                names[i] = apartmentsArr[i].name;
                tenants[i] = apartmentsArr[i].tenant;
                locations[i] = apartmentsArr[i].location;
                rentPrices[i] = apartmentsArr[i].rentPrice;
                rentHikeRates[i] = apartmentsArr[i].rentHikeRate;
                rentStatuses[i] = isRentPaid(tenants[i]);
            }
        }

        return (ids, names, tenants, locations, rentPrices, rentHikeRates, rentStatuses);
    }

    // Function used to return the status of the apartment
    function isApartmentRented(bytes32 _id) public view returns(bool) {
        if (apartments[_id].tenant != 0)
            return true;
        return false;
    }

    // Function used to check if the request was sent
    function isRequestSent(bytes32 _apartment, address _potentialTenant) public view returns(bool) {
        Request[] storage requests = apartmentToRequests[_apartment];
        for (uint i = 0; i < requests.length; i++) {
            if (requests[i].apartment == _apartment && requests[i].from == _potentialTenant) {
                return true;
            }
        }
        return false;
    }

    /**
     * Public functions allowed for landlord only
     */

    // Function used to get all requests for a landlord
    function getAllHireRequests() public view returns(bytes32[] memory, address[] memory, bytes32[] memory) {
        bytes32[] memory ids = new bytes32[](requestsArr.length);
        address[] memory froms = new address[](requestsArr.length);
        bytes32[] memory apartments = new bytes32[](requestsArr.length);

        for (uint i = 0; i < requestsArr.length; i++) {
            if (requestsArr[i].to == msg.sender) {
                ids[i] = requestsArr[i].id;
                froms[i] = requestsArr[i].from;
                apartments[i] = requestsArr[i].apartment;
            }
        }

        return (ids, froms, apartments);
    }

    // Function used to add apartment by the landlord
    function addApartment(bytes32 _name, bytes32 _location, uint _rentPrice, uint8 _rentHikeRate) public returns(bytes32 id) {
        id = keccak256(_name, _location, _rentPrice, _rentHikeRate);
        Apartment memory apartment = Apartment(id, 123456, apartmentsArr.length, _name, msg.sender, address(0), _location, _rentPrice, _rentHikeRate, 0);
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
        success = true;
    }

    // Function used to approve hire request by tenant
    function approveHireRequest(bytes32 _request, bytes32 _apartment, address _potentialTenant) public onlyLandlord(_apartment) returns (bool success) {
        require(isRequestSent(_apartment, _potentialTenant));

        apartments[_apartment].tenant = _potentialTenant;
        apartments[_apartment].nextRentDate = now;

        apartmentsArr[apartments[_apartment].index].tenant = _potentialTenant;
        apartmentsArr[apartments[_apartment].index].nextRentDate = now;

        tenantsToApartment[_potentialTenant] = _apartment;
        tenantToOwner[_potentialTenant] = msg.sender;

        for (uint i = 0; i < requestsArr.length; i++) {
            if (requestsArr[i].id == _request) {
                delete requestsArr[i];
                break;
            }
        }

        delete hireRequests[_request];
        delete apartmentToRequests[_apartment];
        success = true;

        HireRequestApproved(_request, _apartment, _potentialTenant);
    }

    // Function used to collect rent
    function collectRent(bytes32 _apartment, uint hikedRent) public returns (bool success) {
        Apartment storage apartment = apartments[_apartment];
        uint rentPrice = apartment.rentPrice;
        address tenant = apartment.tenant;

        if (apartment.nextRentDate <= now) {
//            require(balances[tenant] >= rentPrice);
//            require(balances[tenant] - rentPrice < balances[tenant]);
//            require(msg.sender.balance + rentPrice > msg.sender.balance);

            balances[tenant] = balances[tenant] - rentPrice;
            msg.sender.transfer(rentPrice);

            uint nextRentDate = getNextMonthDate(now);

            apartments[_apartment].nextRentDate = nextRentDate;
            apartments[_apartment].rentPrice = hikedRent;
            apartmentsArr[apartments[_apartment].index].nextRentDate = nextRentDate;
            apartmentsArr[apartments[_apartment].index].rentPrice = hikedRent;

            Payment memory payment = Payment(keccak256(_apartment, msg.sender, rentPrice, now), _apartment, msg.sender, rentPrice, now);
            paymentHistory[tenant].push(payment);

            Payment memory rent = Payment(keccak256(_apartment, tenant, rentPrice, now), _apartment, tenant, rentPrice, now);
            rentHistory[msg.sender].push(rent);

            RentCollected(_apartment, tenant, msg.sender, hikedRent);

            return true;
        }
        return false;
    }

    // Function used to get rent history of landlord
    function getRentHistory() public view returns(address[] memory, uint[] memory, uint[] memory) {
        Payment[] storage rents = rentHistory[msg.sender];

        address[] memory froms = new address[](rents.length);
        uint[] memory amounts = new uint[](rents.length);
        uint[] memory dates = new uint[](rents.length);

        for (uint i = 0; i < rents.length; i++) {
            froms[i] = rents[i].to;
            amounts[i] = rents[i].amount;
            dates[i] = rents[i].date;
        }

        return(froms, amounts, dates);
    }

    // Function used to get the status of rent of only this month
    function isRentPaid(address _tenant) public view returns(bool) {
        Payment[] memory payments = paymentHistory[_tenant];

        if (payments.length > 0) {
            Payment memory latestPayment = payments[payments.length - 1];

            for (uint i = 0; i < apartmentsArr.length; i++) {
                if (apartmentsArr[i].tenant == _tenant) {
                    Apartment memory apartment = apartmentsArr[i];

                    if (apartment.nextRentDate > latestPayment.date) {
                        return true;
                    }
                    break;
                }
            }
            return false;
        }

        return false;
    }


    /**
     * Public functions allowed for current tenants only
     */

    // Function used to deposit ether to smart contract which is held in escrow
    function makePayment() public payable returns(bool success) {
        RentPaid(msg.sender, msg.value);
//        require(balances[msg.sender] + msg.value > balances[msg.sender]);
//        balances[msg.sender] += msg.value;
        return true;
    }

    // Function used to get payment history of an apartment by tenant
    function getPaymentHistory(bytes32 _apartment) public onlyTenant view returns(address[] memory, uint[] memory, uint[] memory) {
        Payment[] storage payments = paymentHistory[msg.sender];

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
        Apartment storage apartment = apartments[_id];
        require(apartment.tenant == msg.sender);
        return (apartment.id, apartment.name, apartment.owner, apartment.tenant, apartment.location, apartment.rentPrice, apartment.rentHikeRate);
    }

    // Function used to get the current apartment occupied by tenant
    function getCurrentApartment() public onlyTenant view returns(bytes32, bytes32, address, address, bytes32, uint, uint16, bool) {
//    function getCurrentApartment() public onlyTenant view returns(bytes32, bytes32, address, address, bytes32, uint, uint16) {
        bytes32 apartmentId = tenantsToApartment[msg.sender];
        Apartment storage apartment = apartments[apartmentId];
        bool isRented = isRentPaid(apartment.tenant);
        return (apartment.id, apartment.name, apartment.owner, apartment.tenant, apartment.location, apartment.rentPrice, apartment.rentHikeRate, isRented);
//        return (apartment.id, apartment.name, apartment.owner, apartment.tenant, apartment.location, apartment.rentPrice, apartment.rentHikeRate);
    }

    /**
     * Public function allowed for potential tenants only
     */

    // Function used to send hire request to landlord
    function hireApartment(bytes32 _apartment, address _to) public onlyPotentialTenant returns(bool success) {
        bytes32 id = keccak256(_apartment, _to, msg.sender);
        Request memory request = Request(id, _apartment, _to, msg.sender);
        hireRequests[id] = request;
        apartmentToRequests[_apartment].push(request);
        requestsArr.push(request);
        success = true;
        HireRequestReceived(id, _apartment, msg.sender, _to);
    }

    /**
     * Utility functions
     */

    function _stringToBytes32(string memory source) private pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }

    /**
     * Access Modifiers
     */

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