// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

contract ManualToken {
    
    uint256 initialSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) allowance;

    function _transfer(address from, address to, uint256 amount) public {
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public returns (bool) {
        require(amount <= allowance[from][msg.sender]);
        allowance[from][msg.sender] -= amount;
        _transfer(from, to, amount);
        return true;
    }
}
