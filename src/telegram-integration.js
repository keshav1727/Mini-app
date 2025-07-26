// Telegram Web App Integration
class TelegramIntegration {
  constructor() {
    this.tg = window.Telegram?.WebApp;
    this.isTelegram = !!this.tg;
    this.init();
  }

  init() {
    if (this.isTelegram) {
      // Telegram Web App initialization
      this.tg.ready();
      this.tg.expand();
      
      // Set theme
      this.tg.setHeaderColor('#0ea5e9');
      this.tg.setBackgroundColor('#0f172a');
      
      // Enable closing confirmation
      this.tg.enableClosingConfirmation();
      
      console.log('Telegram Web App initialized');
    }
  }

  // Get user info from Telegram
  getUserInfo() {
    if (!this.isTelegram) return null;
    
    return {
      id: this.tg.initDataUnsafe?.user?.id,
      username: this.tg.initDataUnsafe?.user?.username,
      firstName: this.tg.initDataUnsafe?.user?.first_name,
      lastName: this.tg.initDataUnsafe?.user?.last_name,
      languageCode: this.tg.initDataUnsafe?.user?.language_code
    };
  }

  // Show main button
  showMainButton(text, callback) {
    if (!this.isTelegram) return;
    
    this.tg.MainButton.setText(text);
    this.tg.MainButton.onClick(callback);
    this.tg.MainButton.show();
  }

  // Hide main button
  hideMainButton() {
    if (!this.isTelegram) return;
    this.tg.MainButton.hide();
  }

  // Show back button
  showBackButton(callback) {
    if (!this.isTelegram) return;
    
    this.tg.BackButton.onClick(callback);
    this.tg.BackButton.show();
  }

  // Hide back button
  hideBackButton() {
    if (!this.isTelegram) return;
    this.tg.BackButton.hide();
  }

  // Show alert
  showAlert(message) {
    if (!this.isTelegram) {
      alert(message);
      return;
    }
    this.tg.showAlert(message);
  }

  // Show confirm
  showConfirm(message, callback) {
    if (!this.isTelegram) {
      const result = confirm(message);
      callback(result);
      return;
    }
    this.tg.showConfirm(message, callback);
  }

  // Close app
  close() {
    if (!this.isTelegram) return;
    this.tg.close();
  }

  // Get theme
  getTheme() {
    if (!this.isTelegram) return 'light';
    return this.tg.colorScheme; // 'light' or 'dark'
  }

  // Get viewport height
  getViewportHeight() {
    if (!this.isTelegram) return window.innerHeight;
    return this.tg.viewportHeight;
  }

  // Get platform
  getPlatform() {
    if (!this.isTelegram) return 'web';
    return this.tg.platform; // 'android', 'ios', 'web', etc.
  }

  // Haptic feedback
  hapticFeedback(style = 'light') {
    if (!this.isTelegram) return;
    this.tg.HapticFeedback.impactOccurred(style);
  }

  // Share message
  shareMessage(message) {
    if (!this.isTelegram) return;
    this.tg.shareMessage(message);
  }

  // Open link
  openLink(url) {
    if (!this.isTelegram) {
      window.open(url, '_blank');
      return;
    }
    this.tg.openLink(url);
  }

  // Open telegram link
  openTelegramLink(url) {
    if (!this.isTelegram) {
      window.open(url, '_blank');
      return;
    }
    this.tg.openTelegramLink(url);
  }
}

// Export for use in components
export default TelegramIntegration;

// Global instance
export const telegramApp = new TelegramIntegration(); 