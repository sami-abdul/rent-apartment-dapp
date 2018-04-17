pragma solidity ^0.4.2;

import "./Ownable.sol";

/*
Repository smart contract
*/

contract Repository is Ownable {

    // User data struct
//    struct User {
//        bytes32 email;
//        address wallet;
//        bool isLandlord;
//    }

    // Apartment data struct
    struct Apartment {
        bytes32 id;
        uint key;
        uint index;
        bytes32 name;
        address owner;
        address tenant;
        bytes32 location;
        uint rentPrice;
        uint16 rentHikeRate;
        Date nextRentDate;
    }

    struct Date {
        uint16 year;
        uint16 month;
        uint8 day;
    }

    // Payment data struct
    struct Payment {
        bytes32 id;
        bytes32 apartment;
        address to;
        uint amount;
        uint date;
    }

    // Request data struct
    struct Request {
        bytes32 id;
        bytes32 apartment;
        address to;
        address from;
    }

    // Contract Owner address
    address public owner;

    // Mapping used to store users registered on the platform
//    mapping(bytes32 => User) users;
   mapping(address => address) tenantToOwner;

    // Mapping used to store ether balances of all the entities
    mapping(address => uint) internal balances;

    // Apartment data stores
    Apartment[] apartmentsArr;
    mapping(address => bytes32) internal tenantsToApartment;
    mapping(bytes32 => Apartment) internal apartments;

    // Payment data store
    mapping(address => Payment[]) internal paymentHistory;

    // Hire requests data stores
    Request[] requestsArr;
    mapping(bytes32 => Request[]) internal apartmentToRequests;
    mapping(bytes32 => Request) internal hireRequests;
}