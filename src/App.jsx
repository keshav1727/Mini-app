import React, { useState } from "react";
import Submit from "./pages/Submit";
import Marketplace from "./pages/Marketplace";
import { connectWallet } from "./utils/wallet";
import YourProjects from "./pages/YourProjects";

const App = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [signer, setSigner] = useState(null);
  const [activeTab, setActiveTab] = useState("marketplace");

  const handleConnect = async () => {
    const result = await connectWallet();
    if (result) {
      setWalletAddress(result.address);
      setSigner(result.signer);
    }
  };

  const handleDisconnect = () => {
    setWalletAddress("");
    setSigner(null);
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>🚀 Idea Marketplace</h1>

        {walletAddress ? (
          <div className="wallet-actions">
            <p>✅ {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
            <button onClick={handleDisconnect} className="wallet-btn">❌ Disconnect</button>
          </div>
        ) : (
          <button onClick={handleConnect} className="connect-btn">🔗 Connect Wallet</button>
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
              📤 Submit Your Project
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
