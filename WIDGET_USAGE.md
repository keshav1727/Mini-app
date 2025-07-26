# 💡 Idea Marketplace Mini App - Usage Guide

## Overview
The Idea Marketplace Mini App is a compact, embeddable widget that allows users to submit or purchase ideas directly from any website or platform.

## Quick Start

### 1. Basic Embed (Submit Mode)
```html
<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
</head>
<body>
    <h1>Welcome to My Site</h1>
    
    <!-- Idea Marketplace Widget -->
    <div id="idea-marketplace-widget"></div>
    
    <script src="https://your-domain.com/widget.js"></script>
    <script>
        // Initialize widget in submit mode
        window.initIdeaMarketplaceWidget({
            mode: 'submit',
            width: '400px'
        });
    </script>
</body>
</html>
```

### 2. View Specific Idea
```html
<div id="idea-marketplace-widget"></div>

<script src="https://your-domain.com/widget.js"></script>
<script>
    // Show specific idea for purchase
    window.initIdeaMarketplaceWidget({
        mode: 'view',
        ideaId: '123', // The idea ID to display
        width: '400px'
    });
</script>
```

### 3. Using Data Attributes
```html
<script 
    src="https://your-domain.com/widget.js"
    data-mode="submit"
    data-width="500px">
</script>
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `mode` | string | 'submit' | 'submit' or 'view' |
| `ideaId` | string | null | Required for view mode |
| `width` | string | '400px' | Widget width |
| `height` | string | 'auto' | Widget height |
| `theme` | string | 'dark' | 'dark' or 'light' |

## Success Callbacks

```javascript
// Set up success callback
window.ideaMarketplaceSuccessCallback = function(message) {
    console.log('Success:', message);
    // Show notification, update UI, etc.
};

// Initialize widget
window.initIdeaMarketplaceWidget({
    mode: 'submit'
});
```

## Integration Examples

### 1. WordPress Plugin
```php
function add_idea_marketplace_widget() {
    echo '<div id="idea-marketplace-widget"></div>';
    echo '<script src="https://your-domain.com/widget.js"></script>';
    echo '<script>
        window.initIdeaMarketplaceWidget({
            mode: "submit",
            width: "100%"
        });
    </script>';
}
add_shortcode('idea_marketplace', 'add_idea_marketplace_widget');
```

### 2. React Component
```jsx
import React, { useEffect } from 'react';

const IdeaMarketplaceWidget = ({ mode = 'submit', ideaId = null }) => {
    useEffect(() => {
        // Load widget script
        const script = document.createElement('script');
        script.src = 'https://your-domain.com/widget.js';
        script.onload = () => {
            window.initIdeaMarketplaceWidget({
                mode,
                ideaId,
                width: '100%'
            });
        };
        document.head.appendChild(script);
        
        return () => {
            document.head.removeChild(script);
        };
    }, [mode, ideaId]);
    
    return <div id="idea-marketplace-widget" />;
};

export default IdeaMarketplaceWidget;
```

### 3. Shopify App
```liquid
<!-- In your Shopify theme -->
<div id="idea-marketplace-widget"></div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const script = document.createElement('script');
    script.src = 'https://your-domain.com/widget.js';
    script.onload = function() {
        window.initIdeaMarketplaceWidget({
            mode: 'submit',
            width: '100%'
        });
    };
    document.head.appendChild(script);
});
</script>
```

## Styling Customization

### Custom CSS Override
```css
/* Override widget styles */
#idea-marketplace-widget .mini-app-container {
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

#idea-marketplace-widget .mini-header h3 {
    color: #your-brand-color;
}
```

### Theme Integration
```javascript
// Match your site's theme
window.initIdeaMarketplaceWidget({
    theme: 'light', // or 'dark'
    width: '100%'
});
```

## Mobile Responsiveness

The widget is fully responsive and works on all devices:

```javascript
// Responsive configuration
window.initIdeaMarketplaceWidget({
    width: '100%',
    maxWidth: '500px' // Optional max width
});
```

## Security Considerations

1. **HTTPS Only**: Always serve the widget over HTTPS
2. **CORS**: Configure proper CORS headers on your server
3. **Content Security Policy**: Add necessary CSP headers

```html
<!-- Example CSP -->
<meta http-equiv="Content-Security-Policy" 
      content="script-src 'self' https://your-domain.com; 
               style-src 'self' 'unsafe-inline';">
```

## Performance Optimization

### Lazy Loading
```javascript
// Load widget only when needed
function loadIdeaMarketplace() {
    if (!window.initIdeaMarketplaceWidget) {
        const script = document.createElement('script');
        script.src = 'https://your-domain.com/widget.js';
        script.onload = () => {
            window.initIdeaMarketplaceWidget({
                mode: 'submit'
            });
        };
        document.head.appendChild(script);
    }
}

// Load on scroll or button click
document.getElementById('load-widget').addEventListener('click', loadIdeaMarketplace);
```

### Preloading
```html
<!-- Preload widget for better performance -->
<link rel="preload" href="https://your-domain.com/widget.js" as="script">
```

## Troubleshooting

### Common Issues

1. **Widget not loading**
   - Check if script URL is correct
   - Verify HTTPS is being used
   - Check browser console for errors

2. **Wallet connection issues**
   - Ensure MetaMask is installed
   - Check if user has approved the connection

3. **Styling conflicts**
   - Use more specific CSS selectors
   - Check for conflicting CSS rules

### Debug Mode
```javascript
// Enable debug logging
window.ideaMarketplaceDebug = true;
window.initIdeaMarketplaceWidget({
    mode: 'submit'
});
```

## Support

For technical support or feature requests, please contact:
- Email: support@your-domain.com
- GitHub: https://github.com/your-repo/issues
- Discord: https://discord.gg/your-server

---

*Built with ❤️ for the Web3 community* 