import React, { useState } from "react";
import { ethers } from "ethers";
import { getContract } from "../utils/useContracts";

const Submit = ({ signer }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const uploadToPinata = async () => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1OTI1ZjU4NC01NmQwLTQzMzAtYTMzZS05N2NmOGM0ZDk3YWIiLCJlbWFpbCI6Imtlc2hhdmJhamFqMTcwOEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNWU4ODc4N2FmNTI0MmQzYTdjZDkiLCJzY29wZWRLZXlTZWNyZXQiOiJmZDlmNzRjZWUyOTIzZjAxN2U3MmE3MDFkMTI2YTVjNTVkNGIwYjFiNDhiZjc5NzgzMDQ4MzU0OThiN2YzZGJkIiwiZXhwIjoxNzc4MjYwMzAzfQ.98OjrZ9dRZX-ZjMfzs9Jvz-oIqXNzwgiG7MyMvpMxdA`,
      },
      body: formData,
    });

    if (!res.ok) {
      console.error("Pinata error:", await res.text());
      throw new Error("IPFS upload failed");
    }

    const json = await res.json();
    return `https://gateway.pinata.cloud/ipfs/${json.IpfsHash}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!signer) {
      alert("Connect wallet first.");
      return;
    }

    try {
      setLoading(true);
      const docUrl = await uploadToPinata();
      const contract = getContract(signer);
      const tx = await contract.submitIdea(
        title,
        description,
        docUrl,
        externalLink,
        ethers.parseEther(price)
      );
      await tx.wait();
      alert("Idea submitted!");
      setTitle(""); setDescription(""); setFile(null); setExternalLink(""); setPrice("");
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Submission failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="submit-container">
      <h2 className="submit-heading">📤 Submit Your Startup Idea</h2>
      <form onSubmit={handleSubmit} className="submit-form">
        <label>Title</label>
        <input type="text" placeholder="Enter idea title" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label>Description</label>
        <textarea placeholder="Describe your idea" value={description} onChange={(e) => setDescription(e.target.value)} required />

        <label>Upload Docs (PDF, PPT, etc.)</label>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} required />

        <label>External Link (Optional)</label>
        <input type="url" placeholder="https://example.com" value={externalLink} onChange={(e) => setExternalLink(e.target.value)} />

        <label>Price (in ETH)</label>
        <input type="number" step="0.001" placeholder="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "🚀 Submit Idea"}
        </button>
      </form>
    </div>
  );
};

export default Submit;