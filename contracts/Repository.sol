pragma solidity ^0.4.2;

import "./Ownable.sol";

contract Repository is Ownable {

    struct Apartment {
        bytes32 id;
        uint key;
        address tenant;
        string location;
        uint rentPrice;
        uint8 rentHikeRate;
        uint rentDate;
    }

    struct Payment {
        bytes32 id;
        bytes32 apartment;
        uint amount;
        uint date;
    }

    struct Request {
        bytes32 id;
        bytes32 apartment;
        address from;
        uint rentPrice;
        uint8 rentHikeRate;
    }

    address public landlord;

    Apartment[] apartmentsArr;

    mapping(address => uint) internal balances;

    mapping(address => bytes32) internal tenantsToApartment;
    mapping(bytes32 => Apartment) internal apartments;

    mapping(address => Payment) internal paymentHistory;

    mapping(bytes32 => bytes32[]) internal hireRequests;
    mapping(bytes32 => Request) internal requestsForLandlord;
}