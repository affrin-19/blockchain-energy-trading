// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./EnergyToken.sol";
import "./DynamicPricing.sol";

/**
 * @title EnergyMarket
 * @author Blockchain Energy Trading Team
 * @notice Decentralized peer-to-peer energy marketplace enabling prosumers
 *         and consumers to trade energy directly without intermediaries.
 * @dev Manages sell orders, order matching, and settlement using EnergyToken (ERC-20).
 */
contract EnergyMarket is ReentrancyGuard, Ownable {
    // ──────────────────────────────────────────────
    //  State
    // ──────────────────────────────────────────────

    EnergyToken public energyToken;
    DynamicPricing public pricingOracle;

    struct SellOrder {
        uint256 id;
        address seller;
        uint256 energyAmount;   // in token units (kWh * 10^18)
        uint256 pricePerUnit;   // in wei per token unit
        uint256 createdAt;
        bool active;
    }

    uint256 public nextOrderId;
    mapping(uint256 => SellOrder) public sellOrders;
    uint256[] public activeOrderIds;

    uint256 public platformFeeBps; // basis points (100 = 1%)

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────

    event OrderCreated(
        uint256 indexed orderId,
        address indexed seller,
        uint256 energyAmount,
        uint256 pricePerUnit
    );

    event OrderFulfilled(
        uint256 indexed orderId,
        address indexed buyer,
        address indexed seller,
        uint256 energyAmount,
        uint256 totalPrice
    );

    event OrderCancelled(uint256 indexed orderId, address indexed seller);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────

    /**
     * @param _energyToken  Address of the deployed EnergyToken contract.
     * @param _pricingOracle Address of the deployed DynamicPricing contract.
     * @param _owner         Owner address for admin operations.
     * @param _feeBps        Initial platform fee in basis points.
     */
    constructor(
        address _energyToken,
        address _pricingOracle,
        address _owner,
        uint256 _feeBps
    ) Ownable(_owner) {
        require(_energyToken != address(0), "EnergyMarket: zero token address");
        require(_pricingOracle != address(0), "EnergyMarket: zero oracle address");
        require(_feeBps <= 1000, "EnergyMarket: fee too high"); // max 10%

        energyToken = EnergyToken(_energyToken);
        pricingOracle = DynamicPricing(_pricingOracle);
        platformFeeBps = _feeBps;
    }

    // ──────────────────────────────────────────────
    //  Trading
    // ──────────────────────────────────────────────

    /**
     * @notice Creates a sell order for surplus energy.
     * @param energyAmount Amount of energy tokens to sell.
     * @param pricePerUnit Price in wei per energy token unit.
     */
    function createSellOrder(
        uint256 energyAmount,
        uint256 pricePerUnit
    ) external returns (uint256 orderId) {
        require(energyAmount > 0, "EnergyMarket: zero energy amount");
        require(pricePerUnit > 0, "EnergyMarket: zero price");
        require(
            energyToken.balanceOf(msg.sender) >= energyAmount,
            "EnergyMarket: insufficient token balance"
        );

        // Transfer tokens to marketplace escrow
        energyToken.transferFrom(msg.sender, address(this), energyAmount);

        orderId = nextOrderId++;
        sellOrders[orderId] = SellOrder({
            id: orderId,
            seller: msg.sender,
            energyAmount: energyAmount,
            pricePerUnit: pricePerUnit,
            createdAt: block.timestamp,
            active: true
        });

        activeOrderIds.push(orderId);
        emit OrderCreated(orderId, msg.sender, energyAmount, pricePerUnit);
    }

    /**
     * @notice Purchases energy from an existing sell order.
     * @param orderId The ID of the sell order to fulfill.
     */
    function buyEnergy(uint256 orderId) external payable nonReentrant {
        SellOrder storage order = sellOrders[orderId];
        require(order.active, "EnergyMarket: order not active");
        require(order.seller != msg.sender, "EnergyMarket: cannot buy own order");

        uint256 totalPrice = (order.energyAmount * order.pricePerUnit) / 1e18;
        require(msg.value >= totalPrice, "EnergyMarket: insufficient payment");

        order.active = false;

        // Calculate platform fee
        uint256 fee = (totalPrice * platformFeeBps) / 10000;
        uint256 sellerProceeds = totalPrice - fee;

        // Transfer energy tokens to buyer
        energyToken.transfer(msg.sender, order.energyAmount);

        // Transfer ETH to seller
        (bool sent, ) = payable(order.seller).call{value: sellerProceeds}("");
        require(sent, "EnergyMarket: ETH transfer failed");

        // Refund excess ETH
        if (msg.value > totalPrice) {
            (bool refunded, ) = payable(msg.sender).call{
                value: msg.value - totalPrice
            }("");
            require(refunded, "EnergyMarket: refund failed");
        }

        // Update pricing oracle
        pricingOracle.recordTrade(order.energyAmount, order.pricePerUnit);

        emit OrderFulfilled(
            orderId,
            msg.sender,
            order.seller,
            order.energyAmount,
            totalPrice
        );
    }

    /**
     * @notice Cancels an active sell order and returns tokens to the seller.
     * @param orderId The ID of the sell order to cancel.
     */
    function cancelOrder(uint256 orderId) external {
        SellOrder storage order = sellOrders[orderId];
        require(order.active, "EnergyMarket: order not active");
        require(
            order.seller == msg.sender,
            "EnergyMarket: only seller can cancel"
        );

        order.active = false;
        energyToken.transfer(msg.sender, order.energyAmount);

        emit OrderCancelled(orderId, msg.sender);
    }

    // ──────────────────────────────────────────────
    //  View Functions
    // ──────────────────────────────────────────────

    /**
     * @notice Returns all active order IDs.
     */
    function getActiveOrders() external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < activeOrderIds.length; i++) {
            if (sellOrders[activeOrderIds[i]].active) count++;
        }

        uint256[] memory result = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < activeOrderIds.length; i++) {
            if (sellOrders[activeOrderIds[i]].active) {
                result[idx++] = activeOrderIds[i];
            }
        }
        return result;
    }

    // ──────────────────────────────────────────────
    //  Admin
    // ──────────────────────────────────────────────

    /**
     * @notice Updates the platform fee.
     * @param newFeeBps New fee in basis points (max 1000 = 10%).
     */
    function setPlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, "EnergyMarket: fee too high");
        uint256 oldFee = platformFeeBps;
        platformFeeBps = newFeeBps;
        emit PlatformFeeUpdated(oldFee, newFeeBps);
    }

    /**
     * @notice Withdraws accumulated platform fees.
     * @param to Address to receive the fees.
     */
    function withdrawFees(address to) external onlyOwner {
        require(to != address(0), "EnergyMarket: zero address");
        uint256 balance = address(this).balance;
        require(balance > 0, "EnergyMarket: no fees to withdraw");

        (bool sent, ) = payable(to).call{value: balance}("");
        require(sent, "EnergyMarket: withdrawal failed");
    }
}
