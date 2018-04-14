pragma solidity ^0.4.2;

import "./Ownable.sol";

contract Repository is Ownable {

    struct Apartment {
        address id;
        uint16 key;
        address tenant;
        string location;
        uint rentPrice;
        uint8 rentHikeRate;
        uint rentDate;
    }

    struct Payment {
        address id;
        address apartment;
        uint amount;
        uint date;
    }

    struct Request {
        address id;
        address apartment;
        address from;
        uint rentPrice;
        uint8 rentHikeRate;
    }

    address public landlord;

    mapping(address => uint) internal balances;

    mapping(address => address) internal tenantsToApartment;
    mapping(address => Apartment) internal apartments;

    mapping(address => Payment) internal paymentHistory;

    mapping(address => address[]) internal hireRequests;
    mapping(address => Request[]) internal requestsForLandlord;
}