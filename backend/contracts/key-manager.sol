// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract KeyManager {
    address public owner;

    // Key status enum for clarity
    enum Status { Inactive, Active }

    // Struct to hold key info
    struct KeyInfo {
        bool exists;
        Status status;
        uint256 activationDate; // timestamp when activated
        uint256 expiryDate;     // timestamp of expiry
    }

    // Mapping from key hash to its info
    mapping(bytes32 => KeyInfo) private keys;

    event KeyCreated(bytes32 keyHash);
    event KeyActivated(bytes32 keyHash, uint256 activationDate);
    event KeyExpirySet(bytes32 keyHash, uint256 expiryDate);

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_AUTHORIZED");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Create a key with default inactive status and no activation/expiry dates
    function createKey(string memory key) public onlyOwner {
        bytes32 keyHash = keccak256(abi.encodePacked(key));
        require(!keys[keyHash].exists, "KEY_ALREADY_EXISTS"); // Check existence explicitly

        keys[keyHash] = KeyInfo({
            exists: true,
            status: Status.Inactive,
            activationDate: 0,
            expiryDate: 0
        });

        emit KeyCreated(keyHash);
    }

    // Activate a key — sets status active and records current timestamp as activationDate
    function activateKey(string memory key) public onlyOwner {
      bytes32 keyHash = keccak256(abi.encodePacked(key));
      require(keys[keyHash].exists, "KEY_DOES_NOT_EXIST"); // Check existence explicitly
      require(keys[keyHash].status == Status.Inactive, "KEY_ACTIVE_OR_DOESNT_EXIST");

      keys[keyHash].status = Status.Active;
      keys[keyHash].activationDate = block.timestamp;
      keys[keyHash].expiryDate = block.timestamp + 365 days;  // Set expiry 1 year later

      emit KeyActivated(keyHash, block.timestamp);
      emit KeyExpirySet(keyHash, keys[keyHash].expiryDate);
    }

    // View function to get key info
    function getKeyInfo(string memory key) public view returns (Status, uint256 activationDate, uint256 expiryDate) {
        bytes32 keyHash = keccak256(abi.encodePacked(key));
        require(keys[keyHash].exists, "KEY_DOES_NOT_EXIST");

        KeyInfo memory info = keys[keyHash];
        return (info.status, info.activationDate, info.expiryDate);
    }
}
