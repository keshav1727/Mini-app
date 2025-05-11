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
        bool deleted; // ✅ for soft deletion
    }

    mapping(uint => Idea) public ideas;
    mapping(uint => address) public buyerOf;
    uint public nextId;

    event IdeaSubmitted(uint id, string title, address creator);
    event IdeaBought(uint id, address buyer);
    event IdeaEdited(uint id);
    event IdeaDeleted(uint id);

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
            _price,
            false // not deleted
        );
        emit IdeaSubmitted(nextId, _title, msg.sender);
        nextId++;
    }

    function editIdea(
        uint _id,
        string memory _title,
        string memory _description,
        string memory _docUrl,
        string memory _externalLink,
        uint256 _price
    ) public {
        require(ideas[_id].creator == msg.sender, "Not the creator");
        require(!ideas[_id].deleted, "Idea was deleted");

        ideas[_id].title = _title;
        ideas[_id].description = _description;
        ideas[_id].docUrl = _docUrl;
        ideas[_id].externalLink = _externalLink;
        ideas[_id].price = _price;

        emit IdeaEdited(_id);
    }

    function deleteIdea(uint _id) public {
        require(ideas[_id].creator == msg.sender, "Not the creator");
        require(!ideas[_id].deleted, "Already deleted");

        ideas[_id].deleted = true;
        delete buyerOf[_id];

        emit IdeaDeleted(_id);
    }

    function getAllIdeas() public view returns (Idea[] memory) {
        uint activeCount = 0;

        // Count non-deleted ideas
        for (uint i = 0; i < nextId; i++) {
            if (!ideas[i].deleted) {
                activeCount++;
            }
        }

        Idea[] memory result = new Idea[](activeCount);
        uint index = 0;

        for (uint i = 0; i < nextId; i++) {
            if (!ideas[i].deleted) {
                result[index] = ideas[i];
                index++;
            }
        }

        return result;
    }

    function buyIdea(uint id) public payable {
        require(ideas[id].creator != address(0), "Idea does not exist");
        require(!ideas[id].deleted, "Idea deleted");
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
        require(!ideas[id].deleted, "Idea deleted");

        return (
            ideas[id].description,
            ideas[id].docUrl,
            ideas[id].externalLink
        );
    }
}
