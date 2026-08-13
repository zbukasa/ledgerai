import React, { useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';
import { HapticService } from '../services/hapticService';

interface MobileAppProps {
  children: React.ReactNode;
}

const MobileApp: React.FC<MobileAppProps> = ({ children }) => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // --- Status Bar ---
    const setupStatusBar = async () => {
      try {
        // Light icons on dark background (#0F172A) — LedgerAI uses a dark theme by default
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: '#0F172A' });
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch (e) {
        console.warn('StatusBar not available', e);
      }
    };

    // --- Splash Screen ---
    const hideSplash = async () => {
      try {
        await SplashScreen.hide();
      } catch (e) {
        console.warn('SplashScreen not available', e);
      }
    };

    // --- Back Button Handling ---
    const setupBackButton = () => {
      CapApp.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          // If at the root, maybe show a confirmation or just exit
          // For now, we'll let the user exit if they are at the dashboard
          const currentPath = window.location.pathname;
          if (currentPath === '/' || currentPath === '/dashboard') {
            const confirmExit = window.confirm('Exit LedgerAI?');
            if (confirmExit) {
              CapApp.exitApp();
            }
          } else {
            window.history.back();
          }
        } else {
          window.history.back();
        }
      });
    };

    // --- Deep Linking ---
    const setupDeepLinks = () => {
      CapApp.addListener('appUrlOpen', (data: any) => {
        console.log('App opened with URL:', data.url);
        // Handle deep links here
        // Example: ledgerai://promo/LAUNCH30
        const url = new URL(data.url);
        const path = url.pathname; // or host depending on scheme
        
        if (data.url.includes('promo/')) {
          const code = data.url.split('promo/')[1];
          if (code) {
            window.dispatchEvent(new CustomEvent('apply-promo-code', { detail: { code } }));
          }
        }
      });
    };

    setupStatusBar();
    hideSplash();
    setupBackButton();
    setupDeepLinks();

    return () => {
      CapApp.removeAllListeners();
    };
  }, []);

  return <>{children}</>;
};

export default MobileApp;
