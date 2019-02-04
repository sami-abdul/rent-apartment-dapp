pragma solidity 0.5.0;

/*
* Repository smart contract
*/

contract Repository {

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
        uint nextRentDate;
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

    // Mapping used to track relationship between tenant to owner
    mapping(address => address) tenantToOwner;

    // Mapping used to store ether balances of all tenants in escrow
    mapping(address => uint) public balances;

    // Apartment data stores
    Apartment[] apartmentsArr;
    mapping(address => bytes32) internal tenantsToApartment;
    mapping(bytes32 => Apartment) internal apartments;

    // Payment history data store
    mapping(address => Payment[]) internal paymentHistory;

    // Rent history data store
    mapping(address => Payment[]) internal rentHistory;

    // Hire requests data stores
    Request[] requestsArr;
    mapping(bytes32 => Request[]) internal apartmentToRequests;
    mapping(bytes32 => Request) internal hireRequests;
}