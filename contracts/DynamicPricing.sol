// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DynamicPricing
 * @author Blockchain Energy Trading Team
 * @notice On-chain pricing oracle that adjusts energy prices dynamically based
 *         on supply-demand signals from the P2P energy marketplace.
 * @dev Maintains a rolling average of recent trade prices and applies a
 *      supply-demand multiplier to compute the recommended price.
 */
contract DynamicPricing is Ownable {
    // ──────────────────────────────────────────────
    //  State
    // ──────────────────────────────────────────────

    uint256 public basePrice;       // Base price in wei per kWh token
    uint256 public currentPrice;    // Current dynamic price

    uint256 public totalSupply;     // Total energy listed for sale (kWh units)
    uint256 public totalDemand;     // Total energy purchased (kWh units)

    uint256 public constant MIN_PRICE = 0.0001 ether;
    uint256 public constant MAX_PRICE = 1 ether;

    /// @notice Address of the EnergyMarket contract authorized to report trades.
    address public marketContract;

    struct TradeRecord {
        uint256 amount;
        uint256 price;
        uint256 timestamp;
    }

    TradeRecord[] public tradeHistory;

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────

    event PriceUpdated(uint256 oldPrice, uint256 newPrice, uint256 timestamp);
    event TradeRecorded(uint256 amount, uint256 price, uint256 timestamp);
    event BasePriceUpdated(uint256 oldBasePrice, uint256 newBasePrice);
    event MarketContractUpdated(address oldMarket, address newMarket);

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────

    /**
     * @param _basePrice Initial base price in wei per kWh.
     * @param _owner     Owner address for admin operations.
     */
    constructor(uint256 _basePrice, address _owner) Ownable(_owner) {
        require(_basePrice >= MIN_PRICE, "DynamicPricing: below min price");
        require(_basePrice <= MAX_PRICE, "DynamicPricing: above max price");

        basePrice = _basePrice;
        currentPrice = _basePrice;
    }

    // ──────────────────────────────────────────────
    //  Price Calculation
    // ──────────────────────────────────────────────

    /**
     * @notice Records a completed trade and recalculates the dynamic price.
     * @dev Only callable by the authorized EnergyMarket contract.
     * @param amount The energy amount traded.
     * @param price  The price per unit of the trade.
     */
    function recordTrade(uint256 amount, uint256 price) external {
        require(
            msg.sender == marketContract || msg.sender == owner(),
            "DynamicPricing: unauthorized"
        );

        totalDemand += amount;

        tradeHistory.push(
            TradeRecord({
                amount: amount,
                price: price,
                timestamp: block.timestamp
            })
        );

        emit TradeRecorded(amount, price, block.timestamp);
        _updatePrice();
    }

    /**
     * @notice Reports new energy supply added to the market.
     * @param amount The energy amount listed for sale.
     */
    function reportSupply(uint256 amount) external {
        require(
            msg.sender == marketContract || msg.sender == owner(),
            "DynamicPricing: unauthorized"
        );
        totalSupply += amount;
        _updatePrice();
    }

    /**
     * @notice Returns the current recommended price per kWh.
     */
    function getCurrentPrice() external view returns (uint256) {
        return currentPrice;
    }

    /**
     * @notice Returns the number of recorded trades.
     */
    function getTradeCount() external view returns (uint256) {
        return tradeHistory.length;
    }

    // ──────────────────────────────────────────────
    //  Internal
    // ──────────────────────────────────────────────

    /**
     * @dev Recalculates the current price using a supply-demand ratio.
     *      price = basePrice * (demand / supply)
     *      Clamped between MIN_PRICE and MAX_PRICE.
     */
    function _updatePrice() internal {
        uint256 oldPrice = currentPrice;
        uint256 newPrice;

        if (totalSupply == 0 && totalDemand == 0) {
            newPrice = basePrice;
        } else if (totalSupply == 0) {
            newPrice = MAX_PRICE; // No supply → max price
        } else {
            // demand-to-supply ratio with 1e18 precision
            uint256 ratio = (totalDemand * 1e18) / totalSupply;
            newPrice = (basePrice * ratio) / 1e18;
        }

        // Clamp to bounds
        if (newPrice < MIN_PRICE) newPrice = MIN_PRICE;
        if (newPrice > MAX_PRICE) newPrice = MAX_PRICE;

        currentPrice = newPrice;
        emit PriceUpdated(oldPrice, newPrice, block.timestamp);
    }

    // ──────────────────────────────────────────────
    //  Admin
    // ──────────────────────────────────────────────

    /**
     * @notice Updates the base price.
     * @param _newBasePrice New base price in wei.
     */
    function setBasePrice(uint256 _newBasePrice) external onlyOwner {
        require(_newBasePrice >= MIN_PRICE, "DynamicPricing: below min price");
        require(_newBasePrice <= MAX_PRICE, "DynamicPricing: above max price");

        uint256 oldBasePrice = basePrice;
        basePrice = _newBasePrice;
        emit BasePriceUpdated(oldBasePrice, _newBasePrice);
        _updatePrice();
    }

    /**
     * @notice Sets the authorized market contract address.
     * @param _marketContract Address of the EnergyMarket contract.
     */
    function setMarketContract(address _marketContract) external onlyOwner {
        require(_marketContract != address(0), "DynamicPricing: zero address");
        address oldMarket = marketContract;
        marketContract = _marketContract;
        emit MarketContractUpdated(oldMarket, _marketContract);
    }
}
