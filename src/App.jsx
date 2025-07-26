import React, { useState, useEffect } from "react";
import Submit from "./pages/Submit";
import Marketplace from "./pages/Marketplace";
import { connectWallet } from "./utils/wallet";
import YourProjects from "./pages/YourProjects";
import TelegramMiniApp from "./components/TelegramMiniApp";
import "./components/TelegramMiniApp.css";

const App = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [signer, setSigner] = useState(null);
  const [activeTab, setActiveTab] = useState("marketplace");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);
  const [marketplaceStats, setMarketplaceStats] = useState({
    totalIdeas: 0,
    totalVolume: "0",
    activeCreators: 0
  });

  useEffect(() => {
    // Check if running in Telegram Web App
    const checkTelegram = () => {
      const tg = window.Telegram?.WebApp;
      if (tg) {
        setIsTelegram(true);
        console.log("Running in Telegram Web App");
      }
    };
    
    checkTelegram();
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const result = await connectWallet();
      if (result) {
        setWalletAddress(result.address);
        setSigner(result.signer);
      }
    } catch (error) {
      console.error("Connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setWalletAddress("");
    setSigner(null);
    setActiveTab("marketplace");
  };

  // Auto-connect if wallet was previously connected
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum && window.ethereum.selectedAddress) {
        await handleConnect();
      }
    };
    checkConnection();
  }, []);

  // If running in Telegram, show Telegram Mini App
  if (isTelegram) {
    return <TelegramMiniApp />;
  }

  // Regular web app interface
  return (
    <div className="app-container">
      <header className="header">
        <h1>💡 Idea Marketplace</h1>

        {walletAddress ? (
          <div className="wallet-actions">
            <p>✅ {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
            <button onClick={handleDisconnect} className="wallet-btn">
              🔌 Disconnect
            </button>
          </div>
        ) : (
          <button 
            onClick={handleConnect} 
            className="connect-btn"
            disabled={isConnecting}
          >
            {isConnecting ? "🔄 Connecting..." : "🔗 Connect Wallet"}
          </button>
        )}

        {signer && (
          <div className="tab-buttons">
            <button
              className={activeTab === "marketplace" ? "active" : ""}
              onClick={() => setActiveTab("marketplace")}
            >
              🛒 Marketplace
            </button>
            <button
              className={activeTab === "submit" ? "active" : ""}
              onClick={() => setActiveTab("submit")}
            >
              📤 Submit Idea
            </button>
            <button
              className={activeTab === "your-projects" ? "active" : ""}
              onClick={() => setActiveTab("your-projects")}
            >
              📁 Your Projects
            </button>
          </div>
        )}
      </header>

      <main className="main-content">
        {!signer && (
          <div className="welcome-section">
            <div className="welcome-card">
              <h2>Welcome to the Future of Innovation</h2>
              <p>
                Discover, buy, and sell groundbreaking startup ideas on the blockchain. 
                Connect your wallet to get started and explore a world of entrepreneurial opportunities.
              </p>
              
              {/* Marketplace Stats */}
              <div className="marketplace-stats-overview">
                <div className="stat-item">
                  <span className="stat-number">{marketplaceStats.totalIdeas}</span>
                  <span className="stat-label">Ideas Available</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{marketplaceStats.totalVolume} ETH</span>
                  <span className="stat-label">Total Volume</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{marketplaceStats.activeCreators}</span>
                  <span className="stat-label">Active Creators</span>
                </div>
              </div>
              
              <div className="features">
                <div className="feature">
                  <span className="feature-icon">🔒</span>
                  <h3>Secure & Decentralized</h3>
                  <p>All transactions are secured by blockchain technology</p>
                </div>
                <div className="feature">
                  <span className="feature-icon">💡</span>
                  <h3>Innovative Ideas</h3>
                  <p>Access to cutting-edge startup concepts and business models</p>
                </div>
                <div className="feature">
                  <span className="feature-icon">🚀</span>
                  <h3>Launch Your Vision</h3>
                  <p>Turn your ideas into reality with our marketplace platform</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {signer && activeTab === "submit" && <Submit signer={signer} />}
        {signer && activeTab === "marketplace" && <Marketplace signer={signer} />}
        {signer && activeTab === "your-projects" && (
          <YourProjects signer={signer} walletAddress={walletAddress} />
        )}
      </main>
    </div>
  );
};

export default App;