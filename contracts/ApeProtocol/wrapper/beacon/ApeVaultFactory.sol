pragma solidity ^0.8.2;

import "./ApeVault.sol";
import "./ApeBeacon.sol";

contract ApeVaultFactoryBeacon {
	mapping(address => bool) public vaultRegistry;

	address public yearnRegistry;
	address public apeRegistry;
	address public beacon;

	event VaultCreated(address vault);

	constructor(address _reg, address _apeReg, address _beacon) {
		apeRegistry = _apeReg;
		yearnRegistry = _reg;
		beacon = _beacon;
	}

	function createApeVault(address _token, address _simpleToken) external {
		bytes memory data = abi.encodeWithSignature("init(address,address,address,address)", apeRegistry, _token, yearnRegistry, _simpleToken);
		ApeBeacon proxy = new ApeBeacon(beacon, data);
		ApeVaultWrapperImplementation(address(proxy)).transferOwnership(msg.sender);
		vaultRegistry[address(proxy)] = true;
		emit VaultCreated(address(proxy));
	}
}