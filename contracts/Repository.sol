pragma solidity ^0.4.2;

import "./Ownable.sol";

/*
    Repository smart contract
*/

contract Repository is Ownable {

    // Apartment data struct
    struct Apartment {
        bytes32 id;
        uint key;
        bytes32 name;
        address tenant;
        bytes32 location;
        uint rentPrice;
        uint8 rentHikeRate;
        uint rentDate;
    }

    // Payment data struct
    struct Payment {
        bytes32 id;
        bytes32 apartment;
        uint amount;
        uint date;
    }

    // Request data struct
    struct Request {
        bytes32 id;
        bytes32 apartment;
        address from;
        uint rentPrice;
        uint8 rentHikeRate;
    }

    // Landlord address
    address public landlord;

    // Mapping used to store ether balances of all the entities
    mapping(address => uint) internal balances;

    // Apartment data store
    Apartment[] apartmentsArr;
    mapping(address => bytes32) internal tenantsToApartment;
    mapping(bytes32 => Apartment) internal apartments;

    // Payment data store
    mapping(address => Payment) internal paymentHistory;

    // Hire requests data store
    mapping(bytes32 => bytes32[]) internal hireRequests;
    mapping(bytes32 => Request) internal requestsForLandlord;
}