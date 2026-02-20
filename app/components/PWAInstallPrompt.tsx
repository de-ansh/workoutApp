'use client';

import React, { useState, useEffect } from 'react';

interface PWAInstallPromptProps {
  onInstalled?: () => void;
}

export function PWAInstallPrompt({ onInstalled }: PWAInstallPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [platform, setPlatform] = useState<'iOS' | 'Android' | 'Web' | null>(null);

  useEffect(() => {
    // Detect platform
    const pwaManager = (window as any).pwaManager;
    if (typeof window !== 'undefined' && pwaManager) {
      setPlatform(pwaManager.getPlatform() as any);

      // Listen for install prompt availability
      window.addEventListener('pwa-install-prompt-available', () => {
        const pm = (window as any).pwaManager;
        if (pm && pm.canInstall()) {
          setShowPrompt(true);
        }
      });

      // Listen for successful installation
      window.addEventListener('pwa-installed', () => {
        setIsInstalled(true);
        setShowPrompt(false);
        if (onInstalled) onInstalled();
      });

      // Listen for updates
      window.addEventListener('pwa-update-available', () => {
        setShowUpdate(true);
      });

      // Check current installation status
      if (pwaManager && pwaManager.isInstalled) {
        setIsInstalled(true);
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('pwa-install-prompt-available', () => {});
        window.removeEventListener('pwa-installed', () => {});
        window.removeEventListener('pwa-update-available', () => {});
      }
    };
  }, [onInstalled]);

  const handleInstall = async () => {
    const pwaManager = (window as any).pwaManager;
    if (typeof window !== 'undefined' && pwaManager) {
      setIsInstalling(true);
      try {
        const result = await pwaManager.promptInstall();
        if (result) {
          setShowPrompt(false);
          setIsInstalled(true);
          if (onInstalled) onInstalled();
        }
      } catch (err) {
        console.error('Installation failed:', err);
      } finally {
        setIsInstalling(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  const handleUpdate = () => {
    // Reload page to activate new service worker
    window.location.reload();
  };

  // Don't show anything on iOS if app is not installed (iOS requires manual add to home screen)
  if (platform === 'iOS' && !isInstalled) {
    return null;
  }

  // Show update notification
  if (showUpdate) {
    return (
      <div className="fixed bottom-24 left-6 right-6 z-40 animate-in slide-in-from-bottom-2 duration-300">
        <div className="glass rounded-[24px] p-4 border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-white">Update Available</div>
              <div className="text-xs text-gray-400 mt-1">New version of Daily Grind is ready</div>
            </div>
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 active:scale-95 transition-all whitespace-nowrap"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show install prompt for Android
  if (showPrompt && platform === 'Android') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="glass rounded-[40px] p-8 max-w-sm bg-[#121216] border border-white/10">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">📱</div>
            <h2 className="text-2xl heading-bebas text-white mb-2">Install Daily Grind</h2>
            <p className="text-sm text-gray-400">
              Get quick access to your workouts right from your home screen
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 mb-6">
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">✓</span>
                <span className="text-sm text-gray-300">Works offline - train anywhere</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">✓</span>
                <span className="text-sm text-gray-300">Fast loading - app-like experience</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">✓</span>
                <span className="text-sm text-gray-300">No app store required</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDismiss}
              className="flex-1 py-3 rounded-2xl border border-white/10 text-gray-400 font-bold heading-bebas tracking-widest hover:text-white transition-colors"
            >
              Later
            </button>
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="flex-1 py-3 rounded-2xl bg-primary text-white font-bold heading-bebas tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
            >
              {isInstalling ? 'Installing...' : 'Install'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show manual install instructions for iOS
  if (!isInstalled && platform === 'iOS') {
    return (
      <div className="fixed bottom-24 left-6 right-6 z-40 animate-in slide-in-from-bottom-2 duration-300">
        <div className="glass rounded-[24px] p-4 border border-primary/30 bg-primary/10 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <span className="text-xl mt-1">📱</span>
            <div>
              <div className="text-sm font-bold text-white">Add to Home Screen</div>
              <div className="text-xs text-gray-400 mt-1">
                Tap the Share button, then tap "Add to Home Screen" for quick access
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
