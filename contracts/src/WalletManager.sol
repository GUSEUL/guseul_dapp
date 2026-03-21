pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract WalletManager {
    address public constant USDC_ADDRESS =
        0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d;

    //Transfer USDC from the user to the contract
    function transferUsdc(address to, uint256 amount) public {
        require(
            IERC20(USDC_ADDRESS).transferFrom(msg.sender, to, amount),
            "Transfer failed"
        );
    }
    function batchTransferUsdc(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external {
        require(recipients.length == amounts.length, "Arrays length mismatch");

        for (uint256 i = 0; i < recipients.length; i++) {
            require(
                IERC20(USDC_ADDRESS).transferFrom(
                    msg.sender,
                    recipients[i],
                    amounts[i]
                ),
                "Batch transfer failed"
            );
        }
    }
    function getUsdcBalance(address account) public view returns (uint256) {
        return IERC20(USDC_ADDRESS).balanceOf(account);
    }
}
