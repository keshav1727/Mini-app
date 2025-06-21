import React, { useState } from "react";
import { ethers } from "ethers";
import { getContract } from "../utils/useContracts";

const Submit = ({ signer }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    externalLink: "",
    price: ""
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const uploadToPinata = async () => {
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1OTI1ZjU4NC01NmQwLTQzMzAtYTMzZS05N2NmOGM0ZDk3YWIiLCJlbWFpbCI6Imtlc2hhdmJhamFqMTcwOEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNWU4ODc4N2FmNTI0MmQzYTdjZDkiLCJzY29wZWRLZXlTZWNyZXQiOiJmZDlmNzRjZWUyOTIzZjAxN2U3MmE3MDFkMTI2YTVjNTVkNGIwYjFiNDhiZjc5NzgzMDQ4MzU0OThiN2YzZGJkIiwiZXhwIjoxNzc4MjYwMzAzfQ.98OjrZ9dRZX-ZjMfzs9Jvz-oIqXNzwgiG7MyMvpMxdA`,
      },
      body: formDataUpload,
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

    if (!file) {
      alert("Please upload a document file.");
      return;
    }

    try {
      setLoading(true);
      
      // Upload to IPFS
      const docUrl = await uploadToPinata();
      
      // Submit to blockchain
      const contract = getContract(signer);
      const tx = await contract.submitIdea(
        formData.title,
        formData.description,
        docUrl,
        formData.externalLink,
        ethers.parseEther(formData.price)
      );
      
      await tx.wait();
      
      // Success feedback
      const successDiv = document.createElement('div');
      successDiv.className = 'success-toast';
      successDiv.textContent = '🎉 Idea submitted successfully!';
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 3000);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        externalLink: "",
        price: ""
      });
      setFile(null);
      
    } catch (err) {
      console.error("Submission failed:", err);
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-toast';
      errorDiv.textContent = `❌ Submission failed: ${err.message}`;
      document.body.appendChild(errorDiv);
      setTimeout(() => errorDiv.remove(), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="submit-container">
      <h2 className="submit-heading">📤 Submit Your Startup Idea</h2>
      <p className="submit-description">
        Share your innovative startup idea with the world. Set your price and let others discover your vision.
      </p>
      
      <form onSubmit={handleSubmit} className="submit-form">
        <div className="form-group">
          <label htmlFor="title">Idea Title *</label>
          <input 
            type="text" 
            id="title"
            name="title"
            placeholder="Enter a compelling title for your idea" 
            value={formData.title} 
            onChange={handleInputChange} 
            required 
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea 
            id="description"
            name="description"
            placeholder="Describe your startup idea in detail. What problem does it solve? What makes it unique?" 
            value={formData.description} 
            onChange={handleInputChange} 
            required 
            rows="5"
          />
        </div>

        <div className="form-group">
          <label htmlFor="file-upload">Upload Documentation *</label>
          <div 
            className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              id="file-upload"
              onChange={(e) => setFile(e.target.files[0])} 
              required 
              accept=".pdf,.doc,.docx,.ppt,.pptx"
            />
            <div className="file-upload-content">
              {file ? (
                <>
                  <div className="file-icon">📄</div>
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="upload-icon">📁</div>
                  <div className="upload-text">
                    <strong>Click to upload</strong> or drag and drop
                  </div>
                  <div className="upload-hint">
                    PDF, DOC, DOCX, PPT, PPTX (Max 10MB)
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="externalLink">External Link (Optional)</label>
          <input 
            type="url" 
            id="externalLink"
            name="externalLink"
            placeholder="https://your-website.com or demo link" 
            value={formData.externalLink} 
            onChange={handleInputChange} 
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Price in ETH *</label>
          <div className="price-input-wrapper">
            <input 
              type="number" 
              id="price"
              name="price"
              step="0.001" 
              min="0.001"
              placeholder="0.01" 
              value={formData.price} 
              onChange={handleInputChange} 
              required 
            />
            <span className="price-currency">ETH</span>
          </div>
          <div className="price-hint">
            Set a fair price for your idea. Consider the value and uniqueness of your concept.
          </div>
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Submitting...
            </>
          ) : (
            <>🚀 Submit Idea</>
          )}
        </button>
      </form>
    </div>
  );
};

export default Submit;