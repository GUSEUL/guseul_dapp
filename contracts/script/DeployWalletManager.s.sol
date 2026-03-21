pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {WalletManager} from "../src/WalletManager.sol";

contract DeployWalletManager is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        WalletManager wm = new WalletManager();

        console.log("WalletManager deployed to:", address(wm));

        string memory addrStr = vm.toString(address(wm));
        vm.writeFile("deployed_address.txt", addrStr);

        vm.stopBroadcast();
    }
}
