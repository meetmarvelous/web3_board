// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MessageBoard {
    struct Message {
        address sender;
        string content;
        uint256 timestamp;
    }

    struct PrivateMessage {
        address sender;
        string encryptedContent;
        uint256 timestamp;
    }

    Message[] public messages;
    mapping(address => string) public pubKeys;
    mapping(address => PrivateMessage[]) privateMessages;

    event NewMessage(address indexed sender, string content, uint256 timestamp);
    event NewPrivateMessage(address indexed sender, address indexed receiver, uint256 timestamp);
    event PublicKeyRegistered(address indexed user, string pubKey);

    function sendMessage(string memory _content) public {
        require(bytes(_content).length > 0, "Message cannot be empty");
        require(bytes(_content).length <= 280, "Message too long");

        messages.push(Message(msg.sender, _content, block.timestamp));
        emit NewMessage(msg.sender, _content, block.timestamp);
    }

    function registerPublicKey(string memory _pubKey) public {
        pubKeys[msg.sender] = _pubKey;
        emit PublicKeyRegistered(msg.sender, _pubKey);
    }

    function getPublicKey(address _user) public view returns (string memory) {
        return pubKeys[_user];
    }

    function sendPrivateMessage(address _to, string memory _encryptedContent) public {
        require(bytes(pubKeys[_to]).length > 0, "Recipient has not registered a public key");
        require(bytes(_encryptedContent).length > 0, "Message cannot be empty");

        privateMessages[_to].push(PrivateMessage(msg.sender, _encryptedContent, block.timestamp));
        emit NewPrivateMessage(msg.sender, _to, block.timestamp);
    }

    function getMyPrivateMessages() public view returns (PrivateMessage[] memory) {
        return privateMessages[msg.sender];
    }

    function getMessages() public view returns (Message[] memory) {
        return messages;
    }

    function getMessageCount() public view returns (uint256) {
        return messages.length;
    }
}
