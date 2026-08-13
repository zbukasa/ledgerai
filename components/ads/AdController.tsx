
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ProcessingInterstitial, RewardedAdModal } from './AdComponents';

interface AdContextType {
  showInterstitial: (onComplete: () => void) => void;
  showRewardedAd: (onReward: () => void) => void;
  adsEnabled: boolean;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

export const AdController: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { hasFeature } = useAuth();
  const [interstitialCallback, setInterstitialCallback] = useState<(() => void) | null>(null);
  const [rewardedCallback, setRewardedCallback] = useState<(() => void) | null>(null);
  const [showRewarded, setShowRewarded] = useState(false);

  const adsEnabled = !hasFeature('NO_ADS');

  const showInterstitial = (onComplete: () => void) => {
    if (!adsEnabled) {
      onComplete();
      return;
    }
    setInterstitialCallback(() => onComplete);
  };

  const showRewardedAd = (onReward: () => void) => {
    setRewardedCallback(() => onReward);
    setShowRewarded(true);
  };

  const handleInterstitialComplete = () => {
    if (interstitialCallback) {
      interstitialCallback();
      setInterstitialCallback(null);
    }
  };

  const handleRewardedComplete = () => {
    if (rewardedCallback) {
      rewardedCallback();
      setRewardedCallback(null);
    }
    setShowRewarded(false);
  };

  return (
    <AdContext.Provider value={{ showInterstitial, showRewardedAd, adsEnabled }}>
      {children}
      {interstitialCallback && (
        <ProcessingInterstitial onComplete={handleInterstitialComplete} />
      )}
      {showRewarded && (
        <RewardedAdModal 
          onReward={handleRewardedComplete} 
          onClose={() => setShowRewarded(false)} 
        />
      )}
    </AdContext.Provider>
  );
};

export const useAds = () => {
  const context = useContext(AdContext);
  if (context === undefined) {
    throw new Error('useAds must be used within an AdController');
  }
  return context;
};
