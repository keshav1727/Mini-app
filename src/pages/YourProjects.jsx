import React, { useEffect, useState } from "react";
import { getContract } from "../utils/useContracts";
import { ethers } from "ethers";

const YourProjects = ({ signer, walletAddress }) => {
  const [ideas, setIdeas] = useState([]);
  const [editingIdea, setEditingIdea] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", docUrl: "", externalLink: "", price: "" });

  useEffect(() => {
    if (!signer) return;

    const loadIdeas = async () => {
      try {
        const contract = getContract(signer);
        const allIdeas = await contract.getAllIdeas();
        const yourIdeas = allIdeas.filter((idea) => idea.creator.toLowerCase() === walletAddress.toLowerCase());
        setIdeas(yourIdeas);
      } catch (err) {
        console.error("Failed to load your ideas:", err);
      }
    };

    loadIdeas();
  }, [signer, walletAddress]);

  const handleDelete = async (id) => {
    try {
      const contract = getContract(signer);
      const tx = await contract.deleteIdea(id);
      await tx.wait();
      setIdeas((prev) => prev.filter((idea) => idea.id !== id));
      alert("Idea deleted!");
    } catch (err) {
      console.error(err);
      alert("Delete failed: " + err.message);
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
      alert("Idea updated!");
      setEditingIdea(null);
      window.location.reload(); // to refresh updated list
    } catch (err) {
      console.error("Edit failed:", err);
      alert("Edit failed: " + err.message);
    }
  };

  return (
    <div className="your-projects">
      <h2 style={{ textAlign: "center", color: "#38bdf8" }}>📁 Your Projects</h2>

      {editingIdea ? (
        <form onSubmit={handleEditSubmit} className="submit-form">
          <label>Title</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <label>Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <label>Doc URL</label>
          <input value={form.docUrl} onChange={(e) => setForm({ ...form, docUrl: e.target.value })} required />
          <label>External Link</label>
          <input value={form.externalLink} onChange={(e) => setForm({ ...form, externalLink: e.target.value })} />
          <label>Price (ETH)</label>
          <input type="number" step="0.001" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          <button type="submit">✅ Save Changes</button>
          <button type="button" onClick={() => setEditingIdea(null)} style={{ marginLeft: "10px" }}>
            ❌ Cancel
          </button>
        </form>
      ) : (
        ideas.map((idea) => (
          <div key={idea.id} className="idea-card">
            <h3>{idea.title}</h3>
            <p><b>Price:</b> {ethers.formatEther(idea.price)} ETH</p>
            <div style={{ marginTop: "10px" }}>
              <button onClick={() => handleEditClick(idea)}>✏️ Edit</button>
              <button onClick={() => handleDelete(idea.id)} style={{ marginLeft: "10px", color: "red" }}>
                🗑️ Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default YourProjects;
