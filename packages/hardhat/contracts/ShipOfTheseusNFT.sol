// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ShipOfTheseusNFT is ERC721, Ownable {
    using Strings for uint256;

    uint256 public nextTokenId;
    mapping(uint256 => string[]) public traitsHistory;
    mapping(uint256 => address[]) public ownershipHistory;
    mapping(uint256 => uint256) public paradoxScore;
    mapping(uint256 => uint256) public lastTransferTime;
    uint256 public constant AUTO_REVERSE_DELAY = 7 days;

    constructor() ERC721("Ship of Theseus", "SOT") Ownable(msg.sender) {}

    function mint() external {
        _safeMint(msg.sender, nextTokenId);
        traitsHistory[nextTokenId].push("Original");
        ownershipHistory[nextTokenId].push(msg.sender);
        lastTransferTime[nextTokenId] = block.timestamp;
        nextTokenId++;
    }

    function transferFrom(address from, address to, uint256 tokenId) public override {
        super.transferFrom(from, to, tokenId);
        ownershipHistory[tokenId].push(to);
        lastTransferTime[tokenId] = block.timestamp;
        mutateNFT(tokenId);
    }

    function mutateNFT(uint256 tokenId) internal {
        if (traitsHistory[tokenId].length >= 10) {
            traitsHistory[tokenId].pop(); // Forget older traits
        }
        traitsHistory[tokenId].push(generateNewTrait(tokenId));
        paradoxScore[tokenId]++;
    }

    function generateNewTrait(uint256 tokenId) internal view returns (string memory) {
        uint256 randomness = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, tokenId))) % 3;
        if (randomness == 0) return "New Sail";
        if (randomness == 1) return "New Hull";
        return "New Mast";
    }

    function autoReverse(uint256 tokenId) external {
        require(block.timestamp - lastTransferTime[tokenId] > AUTO_REVERSE_DELAY, "Not yet time to reverse");
        require(ownershipHistory[tokenId].length > 1, "No previous owners");

        address lastOwner = ownershipHistory[tokenId][ownershipHistory[tokenId].length - 2];
        _transfer(ownerOf(tokenId), lastOwner, tokenId);
        ownershipHistory[tokenId].pop();
        traitsHistory[tokenId].pop(); // Reverting transformation
    }

    function restoreOriginal(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        delete traitsHistory[tokenId];
        traitsHistory[tokenId].push("Original");
        paradoxScore[tokenId] = 0;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        string memory traits = traitsHistory[tokenId][traitsHistory[tokenId].length - 1];
        string memory json = string(
            abi.encodePacked(
                '{"name": "Ship of Theseus #',
                tokenId.toString(),
                '",',
                '"description": "A paradoxical NFT that changes over time.",',
                '"attributes": [{"trait_type": "Current State", "value": "',
                traits,
                '"},',
                '{"trait_type": "Paradox Score", "value": "',
                paradoxScore[tokenId].toString(),
                '"}]}'
            )
        );
        return string(abi.encodePacked("data:application/json;base64,", encode(bytes(json))));
    }

    function encode(bytes memory data) internal pure returns (string memory) {
        return string(abi.encodePacked("base64,", base64(data)));
    }

    function base64(bytes memory data) internal pure returns (string memory) {
        string memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        uint256 encodedLen = 4 * ((data.length + 2) / 3);
        bytes memory result = new bytes(encodedLen + 32);
        bytes memory tableBytes = bytes(table);

        assembly {
            let tablePtr := add(tableBytes, 1)
            let resultPtr := add(result, 32)
            for {
                let i := 0
            } lt(i, mload(data)) {

            } {
                i := add(i, 3)
                let input := and(mload(add(data, i)), 0xffffff)
                let out := add(
                    mload(add(tablePtr, and(shr(18, input), 0x3F))),
                    shl(
                        8,
                        add(
                            mload(add(tablePtr, and(shr(12, input), 0x3F))),
                            shl(
                                8,
                                add(
                                    mload(add(tablePtr, and(shr(6, input), 0x3F))),
                                    shl(8, mload(add(tablePtr, and(input, 0x3F))))
                                )
                            )
                        )
                    )
                )
                mstore(resultPtr, shl(224, out))
                resultPtr := add(resultPtr, 4)
            }
            mstore(result, encodedLen)
        }
        return string(result);
    }
}
