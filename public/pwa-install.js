// PWA Installation Script - handles install prompts and service worker registration

class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    this.isAndroid = /Android/.test(navigator.userAgent);
    this.isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
    
    this.init();
  }

  init() {
    console.log('[PWA] Initializing PWA Manager');
    
    // Check if app is already installed
    this.checkInstallation();
    
    // Register service worker
    this.registerServiceWorker();
    
    // Listen for install prompt
    this.setupInstallPrompt();
    
    // Check for window controls overlay (desktop PWA)
    this.setupWindowControls();
  }

  checkInstallation() {
    // Check if running as installed app
    if (this.isStandalone) {
      console.log('[PWA] App is running as installed PWA');
      this.isInstalled = true;
      document.documentElement.classList.add('pwa-installed');
      return;
    }

    // Check localStorage for installation flag
    if (localStorage.getItem('pwa-installed')) {
      this.isInstalled = true;
      document.documentElement.classList.add('pwa-installed');
    }
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      console.log('[PWA] Registering Service Worker...');
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('[PWA] Service Worker registered successfully');
          
          // Check for updates periodically
          setInterval(() => {
            registration.update().catch(err => {
              console.warn('[PWA] Failed to check for SW updates:', err);
            });
          }, 60000); // Check every minute
          
          // Handle service worker updates
          registration.addEventListener('updatefound', () => {
            console.log('[PWA] Service Worker update found');
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                this.showUpdateNotification();
              }
            });
          });
        })
        .catch(err => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    } else {
      console.log('[PWA] Service Worker not supported');
    }
  }

  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', event => {
      console.log('[PWA] Install prompt triggered');
      
      // Prevent the mini-infobar from appearing on mobile
      event.preventDefault();
      
      // Store the event for later use
      this.deferredPrompt = event;
      
      // Dispatch custom event for UI to show install button
      window.dispatchEvent(new CustomEvent('pwa-install-prompt-available'));
    });

    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed successfully');
      this.isInstalled = true;
      localStorage.setItem('pwa-installed', 'true');
      document.documentElement.classList.add('pwa-installed');
      
      // Dispatch custom event to notify app
      window.dispatchEvent(new CustomEvent('pwa-installed'));
    });
  }

  setupWindowControls() {
    // Handle window control overlay on desktop PWA
    if (navigator.windowControlsOverlay) {
      navigator.windowControlsOverlay.addEventListener('geometrychange', () => {
        const geometry = navigator.windowControlsOverlay.getTitlebarAreaRect();
        console.log('[PWA] Window controls overlay geometry:', geometry);
      });
    }
  }

  // Public method to trigger install
  async promptInstall() {
    if (!this.deferredPrompt) {
      console.warn('[PWA] Install prompt not available');
      return false;
    }

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      console.log('[PWA] User response to install prompt:', outcome);
      
      if (outcome === 'accepted') {
        this.deferredPrompt = null;
        return true;
      }
      return false;
    } catch (error) {
      console.error('[PWA] Error showing install prompt:', error);
      return false;
    }
  }

  // Show update notification
  showUpdateNotification() {
    console.log('[PWA] Showing update notification');
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  }

  // Check if install is possible
  canInstall() {
    return !!this.deferredPrompt && !this.isInstalled;
  }

  // Share data via Web Share API
  async share(data) {
    if (navigator.share) {
      try {
        await navigator.share(data);
        console.log('[PWA] Shared successfully');
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('[PWA] Share failed:', err);
        }
      }
    } else {
      console.log('[PWA] Web Share API not supported');
    }
  }

  // Detect platform
  getPlatform() {
    if (this.isIOS) return 'iOS';
    if (this.isAndroid) return 'Android';
    return 'Web';
  }

  // Get installation instructions
  getInstallInstructions() {
    if (this.isIOS) {
      return {
        title: 'Add to Home Screen',
        steps: [
          'Tap the Share button',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" to confirm'
        ]
      };
    }
    if (this.isAndroid) {
      return {
        title: 'Install App',
        steps: [
          'Tap the Install button',
          'Confirm to install the app',
          'App will appear on your home screen'
        ]
      };
    }
    return {
      title: 'Install App',
      steps: [
        'Click the Install button',
        'Confirm the installation',
        'App will open when ready'
      ]
    };
  }
}

// Initialize PWA Manager on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.pwaManager = new PWAManager();
  });
} else {
  window.pwaManager = new PWAManager();
}

// Export for use in React components
if (typeof window !== 'undefined') {
  window.PWAManager = PWAManager;
}
