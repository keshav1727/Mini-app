import React from 'react';
import ReactDOM from 'react-dom/client';
import MiniApp from './components/MiniApp';
import './components/MiniApp.css';

// Widget configuration
const widgetConfig = {
  // Default settings
  mode: 'submit', // 'submit' or 'view'
  ideaId: null,   // For view mode
  theme: 'dark',  // 'dark' or 'light'
  width: '400px',
  height: 'auto'
};

// Function to initialize widget
window.initIdeaMarketplaceWidget = function(config = {}) {
  const finalConfig = { ...widgetConfig, ...config };
  
  // Create container if it doesn't exist
  let container = document.getElementById('idea-marketplace-widget');
  if (!container) {
    container = document.createElement('div');
    container.id = 'idea-marketplace-widget';
    document.body.appendChild(container);
  }
  
  // Apply custom styles
  if (finalConfig.width) {
    container.style.width = finalConfig.width;
  }
  if (finalConfig.height) {
    container.style.height = finalConfig.height;
  }
  
  // Success callback
  const handleSuccess = (message) => {
    console.log('Idea Marketplace:', message);
    // You can customize this to show notifications or trigger other actions
    if (window.ideaMarketplaceSuccessCallback) {
      window.ideaMarketplaceSuccessCallback(message);
    }
  };
  
  // Render the widget
  const root = ReactDOM.createRoot(container);
  root.render(
    <MiniApp 
      mode={finalConfig.mode}
      ideaId={finalConfig.ideaId}
      onSuccess={handleSuccess}
    />
  );
  
  return container;
};

// Auto-initialize if script is loaded with data attributes
document.addEventListener('DOMContentLoaded', function() {
  const script = document.currentScript || document.querySelector('script[src*="widget"]');
  if (script) {
    const mode = script.getAttribute('data-mode') || 'submit';
    const ideaId = script.getAttribute('data-idea-id');
    const width = script.getAttribute('data-width') || '400px';
    
    window.initIdeaMarketplaceWidget({
      mode,
      ideaId,
      width
    });
  }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MiniApp, initIdeaMarketplaceWidget: window.initIdeaMarketplaceWidget };
} 