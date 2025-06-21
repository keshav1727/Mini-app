import React, { useEffect, useState } from "react";
import { getContract } from "../utils/useContracts";
import { ethers } from "ethers";

const YourProjects = ({ signer, walletAddress }) => {
  const [ideas, setIdeas] = useState([]);
  const [editingIdea, setEditingIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ 
    title: "", 
    description: "", 
    docUrl: "", 
    externalLink: "", 
    price: "" 
  });

  useEffect(() => {
    if (!signer) return;

    const loadIdeas = async () => {
      try {
        setLoading(true);
        const contract = getContract(signer);
        const allIdeas = await contract.getAllIdeas();
        const yourIdeas = allIdeas.filter((idea) => 
          idea.creator.toLowerCase() === walletAddress.toLowerCase()
        );
        setIdeas(yourIdeas);
      } catch (err) {
        console.error("Failed to load your ideas:", err);
      } finally {
        setLoading(false);
      }
    };

    loadIdeas();
  }, [signer, walletAddress]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this idea? This action cannot be undone.")) {
      return;
    }

    try {
      const contract = getContract(signer);
      const tx = await contract.deleteIdea(id);
      await tx.wait();
      setIdeas((prev) => prev.filter((idea) => idea.id !== id));
      
      const successDiv = document.createElement('div');
      successDiv.className = 'success-toast';
      successDiv.textContent = '🗑️ Idea deleted successfully!';
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 3000);
    } catch (err) {
      console.error(err);
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-toast';
      errorDiv.textContent = `❌ Delete failed: ${err.message}`;
      document.body.appendChild(errorDiv);
      setTimeout(() => errorDiv.remove(), 3000);
    }
  };

  const handleEditClick = (idea) => {
    setEditingIdea(idea);
    setForm({
      title: idea.title,
      description: idea.description,
      docUrl: idea.docUrl,
      externalLink: idea.externalLink,
      price: ethers.formatEther(idea.price),
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const contract = getContract(signer);
      const tx = await contract.editIdea(
        editingIdea.id,
        form.title,
        form.description,
        form.docUrl,
        form.externalLink,
        ethers.parseEther(form.price)
      );
      await tx.wait();
      
      const successDiv = document.createElement('div');
      successDiv.className = 'success-toast';
      successDiv.textContent = '✅ Idea updated successfully!';
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 3000);
      
      setEditingIdea(null);
      
      // Refresh the ideas list
      const allIdeas = await contract.getAllIdeas();
      const yourIdeas = allIdeas.filter((idea) => 
        idea.creator.toLowerCase() === walletAddress.toLowerCase()
      );
      setIdeas(yourIdeas);
    } catch (err) {
      console.error("Edit failed:", err);
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-toast';
      errorDiv.textContent = `❌ Edit failed: ${err.message}`;
      document.body.appendChild(errorDiv);
      setTimeout(() => errorDiv.remove(), 3000);
    }
  };

  if (loading) {
    return (
      <div className="your-projects">
        <h2>📁 Your Projects</h2>
        <div className="loading-projects">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="idea-card loading">
              <div className="loading-content">
                <div className="loading-title"></div>
                <div className="loading-text"></div>
                <div className="loading-actions"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="your-projects">
      <div className="projects-header">
        <h2>📁 Your Projects</h2>
        <div className="projects-stats">
          <div className="stat-item">
            <span className="stat-number">{ideas.length}</span>
            <span className="stat-label">Total Ideas</span>
          </div>
        </div>
      </div>

      {editingIdea ? (
        <div className="edit-form-container">
          <div className="edit-form-header">
            <h3>✏️ Edit Idea</h3>
            <button 
              type="button" 
              onClick={() => setEditingIdea(null)}
              className="close-btn"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleEditSubmit} className="edit-form">
            <div className="form-group">
              <label>Title</label>
              <input 
                value={form.title} 
                onChange={(e) => setForm({ ...form, title: e.target.value })} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                required 
                rows="4"
              />
            </div>
            
            <div className="form-group">
              <label>Document URL</label>
              <input 
                value={form.docUrl} 
                onChange={(e) => setForm({ ...form, docUrl: e.target.value })} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>External Link</label>
              <input 
                value={form.externalLink} 
                onChange={(e) => setForm({ ...form, externalLink: e.target.value })} 
              />
            </div>
            
            <div className="form-group">
              <label>Price (ETH)</label>
              <input 
                type="number" 
                step="0.001" 
                value={form.price} 
                onChange={(e) => setForm({ ...form, price: e.target.value })} 
                required 
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="save-btn">
                ✅ Save Changes
              </button>
              <button 
                type="button" 
                onClick={() => setEditingIdea(null)}
                className="cancel-btn"
              >
                ❌ Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {ideas.length === 0 ? (
            <div className="no-projects">
              <div className="no-projects-icon">📝</div>
              <h3>No projects yet</h3>
              <p>You haven't submitted any ideas yet. Start by creating your first innovative project!</p>
            </div>
          ) : (
            <div className="projects-grid">
              {ideas.map((idea) => (
                <div key={idea.id} className="project-card">
                  <div className="project-header">
                    <h3 className="project-title">{idea.title}</h3>
                    <div className="project-meta">
                      <span className="project-id">ID: {idea.id.toString()}</span>
                      <span className="project-date">
                        {new Date(Number(idea.timestamp) * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="project-content">
                    <p className="project-description">{idea.description}</p>
                    <div className="project-price">
                      <span className="price-label">Price:</span>
                      <span className="price-value">{ethers.formatEther(idea.price)} ETH</span>
                    </div>
                  </div>
                  
                  <div className="project-actions">
                    <button 
                      onClick={() => handleEditClick(idea)}
                      className="edit-btn"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(idea.id)}
                      className="delete-btn"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default YourProjects;