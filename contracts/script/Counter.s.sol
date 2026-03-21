// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/Counter.sol";

contract CheckConnection is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        //open wallet
        vm.startBroadcast(deployerPrivateKey);

        Counter counter = new Counter();

        vm.stopBroadcast();
        console.log("Counter deployed at:", address(counter));

    }
}