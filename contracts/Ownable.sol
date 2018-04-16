pragma solidity ^0.4.2;

/*
    Ownable contract
*/

contract Ownable {
    address public owner;

    // Event triggered when owenership is transferred to some other address
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // Contract constructor
    function Ownable() public {
        owner = msg.sender;
    }

    // Modifier used to restrict access to only owner
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    // Function to transfer ownership to some other address requiring the previous owner to call it
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0));
        OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}