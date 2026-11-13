const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Blockchain-Enabled Energy Trading System", function () {
  let energyToken, dynamicPricing, energyMarket;
  let owner, seller, buyer, minter;

  const BASE_PRICE = ethers.parseEther("0.001"); // 0.001 ETH per kWh
  const PLATFORM_FEE_BPS = 250; // 2.5%

  beforeEach(async function () {
    [owner, seller, buyer, minter] = await ethers.getSigners();

    // Deploy EnergyToken
    const EnergyToken = await ethers.getContractFactory("EnergyToken");
    energyToken = await EnergyToken.deploy(owner.address);
    await energyToken.waitForDeployment();

    // Deploy DynamicPricing
    const DynamicPricing = await ethers.getContractFactory("DynamicPricing");
    dynamicPricing = await DynamicPricing.deploy(BASE_PRICE, owner.address);
    await dynamicPricing.waitForDeployment();

    // Deploy EnergyMarket
    const EnergyMarket = await ethers.getContractFactory("EnergyMarket");
    energyMarket = await EnergyMarket.deploy(
      await energyToken.getAddress(),
      await dynamicPricing.getAddress(),
      owner.address,
      PLATFORM_FEE_BPS
    );
    await energyMarket.waitForDeployment();

    // Configure
    await energyToken.setMinter(await energyMarket.getAddress(), true);
    await dynamicPricing.setMarketContract(await energyMarket.getAddress());
    await energyToken.setMinter(minter.address, true);
  });

  // ─────────────────────────────────────────────────────
  //  EnergyToken Tests
  // ─────────────────────────────────────────────────────

  describe("EnergyToken", function () {
    it("should have correct name and symbol", async function () {
      expect(await energyToken.name()).to.equal("EnergyToken");
      expect(await energyToken.symbol()).to.equal("ENRG");
    });

    it("should allow owner to mint tokens", async function () {
      const amount = ethers.parseEther("100");
      await energyToken.mint(seller.address, amount);
      expect(await energyToken.balanceOf(seller.address)).to.equal(amount);
    });

    it("should allow authorized minters to mint tokens", async function () {
      const amount = ethers.parseEther("50");
      await energyToken.connect(minter).mint(seller.address, amount);
      expect(await energyToken.balanceOf(seller.address)).to.equal(amount);
    });

    it("should reject minting from unauthorized addresses", async function () {
      const amount = ethers.parseEther("100");
      await expect(
        energyToken.connect(buyer).mint(buyer.address, amount)
      ).to.be.revertedWith("EnergyToken: not authorized to mint");
    });

    it("should reject minting zero amount", async function () {
      await expect(
        energyToken.mint(seller.address, 0)
      ).to.be.revertedWith("EnergyToken: amount must be > 0");
    });

    it("should emit EnergyMinted event", async function () {
      const amount = ethers.parseEther("100");
      await expect(energyToken.mint(seller.address, amount))
        .to.emit(energyToken, "EnergyMinted")
        .withArgs(seller.address, amount, (v) => v > 0);
    });

    it("should allow token burning", async function () {
      const amount = ethers.parseEther("100");
      await energyToken.mint(seller.address, amount);
      await energyToken.connect(seller).burn(ethers.parseEther("30"));
      expect(await energyToken.balanceOf(seller.address)).to.equal(
        ethers.parseEther("70")
      );
    });
  });

  // ─────────────────────────────────────────────────────
  //  EnergyMarket Tests
  // ─────────────────────────────────────────────────────

  describe("EnergyMarket", function () {
    const energyAmount = ethers.parseEther("10"); // 10 kWh
    const pricePerUnit = ethers.parseEther("0.001"); // 0.001 ETH/kWh

    beforeEach(async function () {
      // Mint tokens to seller
      await energyToken.mint(seller.address, energyAmount);
      // Approve marketplace
      await energyToken
        .connect(seller)
        .approve(await energyMarket.getAddress(), energyAmount);
    });

    it("should create a sell order", async function () {
      await expect(
        energyMarket.connect(seller).createSellOrder(energyAmount, pricePerUnit)
      )
        .to.emit(energyMarket, "OrderCreated")
        .withArgs(0, seller.address, energyAmount, pricePerUnit);

      const order = await energyMarket.sellOrders(0);
      expect(order.seller).to.equal(seller.address);
      expect(order.energyAmount).to.equal(energyAmount);
      expect(order.active).to.be.true;
    });

    it("should allow buyer to purchase energy", async function () {
      await energyMarket
        .connect(seller)
        .createSellOrder(energyAmount, pricePerUnit);

      const totalPrice =
        (energyAmount * pricePerUnit) / ethers.parseEther("1");

      await expect(
        energyMarket.connect(buyer).buyEnergy(0, { value: totalPrice })
      )
        .to.emit(energyMarket, "OrderFulfilled")
        .withArgs(0, buyer.address, seller.address, energyAmount, totalPrice);

      // Buyer should have the energy tokens
      expect(await energyToken.balanceOf(buyer.address)).to.equal(energyAmount);

      // Order should be inactive
      const order = await energyMarket.sellOrders(0);
      expect(order.active).to.be.false;
    });

    it("should reject buying own order", async function () {
      await energyMarket
        .connect(seller)
        .createSellOrder(energyAmount, pricePerUnit);

      const totalPrice =
        (energyAmount * pricePerUnit) / ethers.parseEther("1");

      await expect(
        energyMarket.connect(seller).buyEnergy(0, { value: totalPrice })
      ).to.be.revertedWith("EnergyMarket: cannot buy own order");
    });

    it("should reject insufficient payment", async function () {
      await energyMarket
        .connect(seller)
        .createSellOrder(energyAmount, pricePerUnit);

      await expect(
        energyMarket.connect(buyer).buyEnergy(0, { value: 1 })
      ).to.be.revertedWith("EnergyMarket: insufficient payment");
    });

    it("should allow seller to cancel order", async function () {
      await energyMarket
        .connect(seller)
        .createSellOrder(energyAmount, pricePerUnit);

      await energyMarket.connect(seller).cancelOrder(0);

      const order = await energyMarket.sellOrders(0);
      expect(order.active).to.be.false;

      // Tokens returned to seller
      expect(await energyToken.balanceOf(seller.address)).to.equal(
        energyAmount
      );
    });

    it("should return active orders", async function () {
      await energyMarket
        .connect(seller)
        .createSellOrder(energyAmount, pricePerUnit);

      const activeOrders = await energyMarket.getActiveOrders();
      expect(activeOrders.length).to.equal(1);
      expect(activeOrders[0]).to.equal(0);
    });
  });

  // ─────────────────────────────────────────────────────
  //  DynamicPricing Tests
  // ─────────────────────────────────────────────────────

  describe("DynamicPricing", function () {
    it("should initialize with base price", async function () {
      expect(await dynamicPricing.getCurrentPrice()).to.equal(BASE_PRICE);
    });

    it("should update price after trade recording", async function () {
      const amount = ethers.parseEther("10");
      const price = ethers.parseEther("0.002");

      await dynamicPricing.recordTrade(amount, price);
      expect(await dynamicPricing.getTradeCount()).to.equal(1);
    });

    it("should allow owner to update base price", async function () {
      const newBasePrice = ethers.parseEther("0.002");
      await dynamicPricing.setBasePrice(newBasePrice);
      expect(await dynamicPricing.basePrice()).to.equal(newBasePrice);
    });

    it("should reject base price below minimum", async function () {
      await expect(
        dynamicPricing.setBasePrice(100) // way below MIN_PRICE
      ).to.be.revertedWith("DynamicPricing: below min price");
    });

    it("should reject unauthorized trade recording", async function () {
      await expect(
        dynamicPricing
          .connect(buyer)
          .recordTrade(ethers.parseEther("5"), ethers.parseEther("0.001"))
      ).to.be.revertedWith("DynamicPricing: unauthorized");
    });
  });

  // ─────────────────────────────────────────────────────
  //  Integration Tests
  // ─────────────────────────────────────────────────────

  describe("End-to-End Trading Flow", function () {
    it("should complete a full energy trade cycle", async function () {
      const energyAmount = ethers.parseEther("5"); // 5 kWh
      const pricePerUnit = ethers.parseEther("0.001");

      // 1. Prosumer generates energy → tokens minted
      await energyToken.mint(seller.address, energyAmount);
      expect(await energyToken.balanceOf(seller.address)).to.equal(
        energyAmount
      );

      // 2. Prosumer lists energy for sale
      await energyToken
        .connect(seller)
        .approve(await energyMarket.getAddress(), energyAmount);
      await energyMarket
        .connect(seller)
        .createSellOrder(energyAmount, pricePerUnit);

      // 3. Consumer purchases energy
      const totalPrice =
        (energyAmount * pricePerUnit) / ethers.parseEther("1");
      const sellerBalanceBefore = await ethers.provider.getBalance(
        seller.address
      );

      await energyMarket
        .connect(buyer)
        .buyEnergy(0, { value: totalPrice });

      // 4. Verify token transfer
      expect(await energyToken.balanceOf(buyer.address)).to.equal(
        energyAmount
      );

      // 5. Verify seller received ETH (minus platform fee)
      const fee = (totalPrice * BigInt(PLATFORM_FEE_BPS)) / 10000n;
      const sellerBalanceAfter = await ethers.provider.getBalance(
        seller.address
      );
      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(
        totalPrice - fee
      );
    });
  });
});
