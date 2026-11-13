// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EnergyToken
 * @author Blockchain Energy Trading Team
 * @notice ERC-20 token representing tradeable energy units in the P2P energy marketplace.
 * @dev Each token represents 1 kWh of energy. Prosumers mint tokens when they
 *      feed energy into the grid, and tokens are burned when energy is consumed.
 */
contract EnergyToken is ERC20, ERC20Burnable, Ownable {
    /// @notice Mapping of addresses authorized to mint tokens (e.g., verified smart meters).
    mapping(address => bool) public authorizedMinters;

    /// @notice Emitted when a minter is authorized or revoked.
    event MinterUpdated(address indexed minter, bool authorized);

    /// @notice Emitted when energy tokens are minted for a prosumer.
    event EnergyMinted(address indexed prosumer, uint256 amount, uint256 timestamp);

    /**
     * @notice Deploys the EnergyToken contract.
     * @param initialOwner The address that will own the contract.
     */
    constructor(address initialOwner)
        ERC20("EnergyToken", "ENRG")
        Ownable(initialOwner)
    {}

    /**
     * @notice Authorizes or revokes an address as a minter.
     * @param minter The address to update.
     * @param authorized Whether the address is authorized to mint.
     */
    function setMinter(address minter, bool authorized) external onlyOwner {
        require(minter != address(0), "EnergyToken: zero address");
        authorizedMinters[minter] = authorized;
        emit MinterUpdated(minter, authorized);
    }

    /**
     * @notice Mints energy tokens to a prosumer's address.
     * @dev Only callable by authorized minters (verified smart meters / oracles).
     * @param to The prosumer's address.
     * @param amount The amount of energy (in kWh, scaled by decimals) to mint.
     */
    function mint(address to, uint256 amount) external {
        require(
            authorizedMinters[msg.sender] || msg.sender == owner(),
            "EnergyToken: not authorized to mint"
        );
        require(to != address(0), "EnergyToken: mint to zero address");
        require(amount > 0, "EnergyToken: amount must be > 0");

        _mint(to, amount);
        emit EnergyMinted(to, amount, block.timestamp);
    }

    /**
     * @notice Returns the number of decimals used for token amounts.
     * @return The number of decimals (18).
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}
