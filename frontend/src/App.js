import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

// ──────────────────────────────────────────────
//  ABI Excerpts (replace with full ABIs after compilation)
// ──────────────────────────────────────────────

const ENERGY_TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
];

const ENERGY_MARKET_ABI = [
  "function createSellOrder(uint256 energyAmount, uint256 pricePerUnit) returns (uint256)",
  "function buyEnergy(uint256 orderId) payable",
  "function cancelOrder(uint256 orderId)",
  "function getActiveOrders() view returns (uint256[])",
  "function sellOrders(uint256) view returns (uint256 id, address seller, uint256 energyAmount, uint256 pricePerUnit, uint256 createdAt, bool active)",
  "event OrderCreated(uint256 indexed orderId, address indexed seller, uint256 energyAmount, uint256 pricePerUnit)",
  "event OrderFulfilled(uint256 indexed orderId, address indexed buyer, address indexed seller, uint256 energyAmount, uint256 totalPrice)",
];

const DYNAMIC_PRICING_ABI = [
  "function getCurrentPrice() view returns (uint256)",
  "function getTradeCount() view returns (uint256)",
];

// ──────────────────────────────────────────────
//  Contract Addresses (update after deployment)
// ──────────────────────────────────────────────

const CONTRACT_ADDRESSES = {
  EnergyToken: process.env.REACT_APP_ENERGY_TOKEN_ADDRESS || "",
  EnergyMarket: process.env.REACT_APP_ENERGY_MARKET_ADDRESS || "",
  DynamicPricing: process.env.REACT_APP_DYNAMIC_PRICING_ADDRESS || "",
};

// ──────────────────────────────────────────────
//  App Component
// ──────────────────────────────────────────────

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0");
  const [tokenBalance, setTokenBalance] = useState("0");
  const [currentPrice, setCurrentPrice] = useState("0");
  const [activeOrders, setActiveOrders] = useState([]);
  const [sellAmount, setSellAmount] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  // ── Connect Wallet ──

  async function connectWallet() {
    if (!window.ethereum) {
      setStatus("Please install MetaMask to use this DApp.");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
      setStatus("Wallet connected!");
      await refreshData(accounts[0]);
    } catch (err) {
      setStatus(`Connection failed: ${err.message}`);
    }
  }

  // ── Refresh Data ──

  async function refreshData(userAccount) {
    if (!userAccount) return;

    const provider = new ethers.BrowserProvider(window.ethereum);

    // ETH balance
    const ethBal = await provider.getBalance(userAccount);
    setBalance(ethers.formatEther(ethBal));

    // Token balance
    if (CONTRACT_ADDRESSES.EnergyToken) {
      const tokenContract = new ethers.Contract(
        CONTRACT_ADDRESSES.EnergyToken,
        ENERGY_TOKEN_ABI,
        provider
      );
      const tokBal = await tokenContract.balanceOf(userAccount);
      setTokenBalance(ethers.formatEther(tokBal));
    }

    // Current price
    if (CONTRACT_ADDRESSES.DynamicPricing) {
      const pricingContract = new ethers.Contract(
        CONTRACT_ADDRESSES.DynamicPricing,
        DYNAMIC_PRICING_ABI,
        provider
      );
      const price = await pricingContract.getCurrentPrice();
      setCurrentPrice(ethers.formatEther(price));
    }

    // Active orders
    if (CONTRACT_ADDRESSES.EnergyMarket) {
      const marketContract = new ethers.Contract(
        CONTRACT_ADDRESSES.EnergyMarket,
        ENERGY_MARKET_ABI,
        provider
      );
      const orderIds = await marketContract.getActiveOrders();
      const orders = await Promise.all(
        orderIds.map(async (id) => {
          const order = await marketContract.sellOrders(id);
          return {
            id: id.toString(),
            seller: order.seller,
            energyAmount: ethers.formatEther(order.energyAmount),
            pricePerUnit: ethers.formatEther(order.pricePerUnit),
            active: order.active,
          };
        })
      );
      setActiveOrders(orders.filter((o) => o.active));
    }
  }

  // ── Create Sell Order ──

  async function handleCreateOrder(e) {
    e.preventDefault();
    if (!account) return;

    setLoading(true);
    setStatus("Creating sell order...");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Approve tokens
      const tokenContract = new ethers.Contract(
        CONTRACT_ADDRESSES.EnergyToken,
        ENERGY_TOKEN_ABI,
        signer
      );
      const amount = ethers.parseEther(sellAmount);
      const price = ethers.parseEther(sellPrice);

      const approveTx = await tokenContract.approve(
        CONTRACT_ADDRESSES.EnergyMarket,
        amount
      );
      await approveTx.wait();

      // Create order
      const marketContract = new ethers.Contract(
        CONTRACT_ADDRESSES.EnergyMarket,
        ENERGY_MARKET_ABI,
        signer
      );
      const tx = await marketContract.createSellOrder(amount, price);
      await tx.wait();

      setStatus("✅ Sell order created successfully!");
      setSellAmount("");
      setSellPrice("");
      await refreshData(account);
    } catch (err) {
      setStatus(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // ── Buy Energy ──

  async function handleBuyEnergy(orderId, totalPrice) {
    if (!account) return;

    setLoading(true);
    setStatus("Purchasing energy...");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const marketContract = new ethers.Contract(
        CONTRACT_ADDRESSES.EnergyMarket,
        ENERGY_MARKET_ABI,
        signer
      );

      const tx = await marketContract.buyEnergy(orderId, {
        value: ethers.parseEther(totalPrice),
      });
      await tx.wait();

      setStatus("✅ Energy purchased successfully!");
      await refreshData(account);
    } catch (err) {
      setStatus(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // ── Auto-refresh on account change ──

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0] || null);
        if (accounts[0]) refreshData(accounts[0]);
      });
    }
  }, []);

  // ── Render ──

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <header style={{ textAlign: "center", marginBottom: 32 }}>
        <h1>⚡ Blockchain Energy Trading</h1>
        <p style={{ color: "#666" }}>
          Decentralized Peer-to-Peer Energy Marketplace
        </p>
      </header>

      {/* Wallet Connection */}
      {!account ? (
        <div style={{ textAlign: "center" }}>
          <button onClick={connectWallet} style={btnStyle}>
            🔗 Connect MetaMask
          </button>
        </div>
      ) : (
        <>
          {/* Dashboard */}
          <div style={cardStyle}>
            <h2>📊 Dashboard</h2>
            <p><strong>Account:</strong> {account}</p>
            <p><strong>ETH Balance:</strong> {parseFloat(balance).toFixed(4)} ETH</p>
            <p><strong>Energy Tokens:</strong> {parseFloat(tokenBalance).toFixed(2)} ENRG (kWh)</p>
            <p><strong>Current Price:</strong> {currentPrice} ETH/kWh</p>
            <button onClick={() => refreshData(account)} style={btnStyle}>
              🔄 Refresh
            </button>
          </div>

          {/* Sell Energy */}
          <div style={cardStyle}>
            <h2>💰 Sell Energy</h2>
            <form onSubmit={handleCreateOrder}>
              <input
                type="number"
                placeholder="Energy Amount (kWh)"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                style={inputStyle}
                step="0.01"
                min="0"
                required
              />
              <input
                type="number"
                placeholder="Price per kWh (ETH)"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                style={inputStyle}
                step="0.0001"
                min="0"
                required
              />
              <button type="submit" disabled={loading} style={btnStyle}>
                {loading ? "Processing..." : "📤 Create Sell Order"}
              </button>
            </form>
          </div>

          {/* Active Orders */}
          <div style={cardStyle}>
            <h2>📋 Available Energy</h2>
            {activeOrders.length === 0 ? (
              <p style={{ color: "#999" }}>No active orders.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Seller</th>
                    <th style={thStyle}>Energy (kWh)</th>
                    <th style={thStyle}>Price (ETH/kWh)</th>
                    <th style={thStyle}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeOrders.map((order) => (
                    <tr key={order.id}>
                      <td style={tdStyle}>{order.id}</td>
                      <td style={tdStyle}>{order.seller.slice(0, 8)}...</td>
                      <td style={tdStyle}>{order.energyAmount}</td>
                      <td style={tdStyle}>{order.pricePerUnit}</td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => {
                            const total = (
                              parseFloat(order.energyAmount) *
                              parseFloat(order.pricePerUnit)
                            ).toString();
                            handleBuyEnergy(order.id, total);
                          }}
                          disabled={loading || order.seller.toLowerCase() === account.toLowerCase()}
                          style={btnSmallStyle}
                        >
                          Buy
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Status */}
      {status && (
        <div style={{ ...cardStyle, backgroundColor: "#f0f9ff", borderColor: "#bae6fd" }}>
          {status}
        </div>
      )}
    </div>
  );
}

// ── Inline Styles ──

const btnStyle = {
  padding: "10px 20px",
  backgroundColor: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 600,
};

const btnSmallStyle = {
  ...btnStyle,
  padding: "6px 12px",
  fontSize: 12,
};

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "10px 12px",
  marginBottom: 12,
  border: "1px solid #d1d5db",
  borderRadius: 6,
  fontSize: 14,
  boxSizing: "border-box",
};

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: 20,
  marginBottom: 20,
};

const thStyle = {
  textAlign: "left",
  padding: 8,
  borderBottom: "2px solid #e5e7eb",
  fontSize: 13,
  color: "#6b7280",
};

const tdStyle = {
  padding: 8,
  borderBottom: "1px solid #f3f4f6",
  fontSize: 14,
};

export default App;
