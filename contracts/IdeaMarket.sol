// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract IdeaMarket {
    struct Idea {
        uint256 id;
        string title;
        string description;
        string docUrl;
        string externalLink;
        address creator;
        uint256 timestamp;
        uint256 price;
    }

    mapping(uint => Idea) public ideas;
    mapping(uint => address) public buyerOf;
    uint public nextId;

    event IdeaSubmitted(uint id, string title, address creator);
    event IdeaBought(uint id, address buyer);

    function submitIdea(
        string memory _title,
        string memory _description,
        string memory _docUrl,
        string memory _externalLink,
        uint256 _price
    ) public {
        ideas[nextId] = Idea(
            nextId,
            _title,
            _description,
            _docUrl,
            _externalLink,
            msg.sender,
            block.timestamp,
            _price
        );
        emit IdeaSubmitted(nextId, _title, msg.sender);
        nextId++;
    }

    function getAllIdeas() public view returns (Idea[] memory) {
        Idea[] memory all = new Idea[](nextId);
        for (uint i = 0; i < nextId; i++) {
            all[i] = ideas[i];
        }
        return all;
    }

    function buyIdea(uint id) public payable {
        require(ideas[id].creator != address(0), "Idea does not exist");
        require(msg.value >= ideas[id].price, "Insufficient payment");
        require(buyerOf[id] == address(0), "Already bought");

        buyerOf[id] = msg.sender;
        payable(ideas[id].creator).transfer(msg.value);
        emit IdeaBought(id, msg.sender);
    }

    function getIdeaDetails(uint id) public view returns (
        string memory, string memory, string memory
    ) {
        require(
            msg.sender == ideas[id].creator || msg.sender == buyerOf[id],
            "Not authorized"
        );
        return (
            ideas[id].description,
            ideas[id].docUrl,
            ideas[id].externalLink
        );
    }
}
