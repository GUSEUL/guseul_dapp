// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
}

contract MyExchange {
    address public constant USDC_ADDRESS =
        0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d;

    function getMYUsdcBalance(address account) public view returns (uint256) {
        return IERC20(USDC_ADDRESS).balanceOf(account);
    }
}
