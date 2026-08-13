
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface AdWrapperProps {
  children: React.ReactNode;
  type: 'banner' | 'in-feed' | 'interstitial' | 'rewarded';
  placement?: string;
}

export const AdWrapper: React.FC<AdWrapperProps> = ({ children, type, placement }) => {
  const { hasFeature } = useAuth();
  const showAds = !hasFeature('NO_ADS');

  if (!showAds) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {children}
      {type === 'banner' && <BannerAd placement={placement} />}
      {type === 'in-feed' && <InFeedAd placement={placement} />}
      {/* Interstitial and Rewarded are handled via modals/overlays, but we can wrap them if needed */}
    </div>
  );
};

export const BannerAd: React.FC<{ placement?: string }> = ({ placement }) => (
  <div className="w-full h-16 bg-gray-100 border-t border-gray-200 flex items-center justify-center text-gray-400 text-xs mt-4 rounded-lg overflow-hidden relative">
    <div className="absolute top-1 left-1 bg-gray-200 px-1 rounded text-[8px] uppercase font-bold tracking-wider">Ad</div>
    <div className="text-center">
      <p className="font-medium">Sponsored Content</p>
      <p className="text-[10px]">Upgrade to Premium to remove ads</p>
    </div>
    {/* Placeholder for AdMob Banner */}
  </div>
);

export const InFeedAd: React.FC<{ placement?: string }> = ({ placement }) => (
  <div className="my-4 p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 text-sm min-h-[100px] relative">
    <div className="absolute top-2 left-2 bg-gray-200 px-1 rounded text-[8px] uppercase font-bold tracking-wider">Sponsored</div>
    <p className="font-medium mb-1 text-gray-500">Ad Placement: {placement || 'Feed'}</p>
    <p className="text-xs text-center px-4">This is a placeholder for an in-feed advertisement.</p>
    <button className="mt-2 text-[10px] text-blue-500 hover:underline">Why am I seeing this?</button>
  </div>
);

export const ProcessingInterstitial: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [timeLeft, setTimeLeft] = React.useState(5);

  React.useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
      <h2 className="text-xl font-bold mb-2">Processing your command...</h2>
      <p className="text-gray-500 mb-8">Please wait while our AI analyzes the data.</p>
      
      <div className="w-full max-w-sm p-8 bg-gray-50 rounded-2xl border border-gray-200 relative">
        <div className="absolute top-2 left-2 bg-gray-200 px-1 rounded text-[8px] uppercase font-bold tracking-wider">Ad</div>
        <div className="h-32 bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-gray-400">
          Ad Content Placeholder
        </div>
        <p className="text-sm font-medium text-gray-600">Upgrade to Premium for instant processing</p>
        <p className="text-xs text-gray-400 mt-2">Continuing in {timeLeft}s...</p>
      </div>
    </div>
  );
};

export const RewardedAdModal: React.FC<{ onReward: () => void; onClose: () => void }> = ({ onReward, onClose }) => {
  const [isWatching, setIsWatching] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(15);

  const startWatching = () => {
    setIsWatching(true);
  };

  React.useEffect(() => {
    if (isWatching && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isWatching && timeLeft === 0) {
      onReward();
    }
  }, [isWatching, timeLeft, onReward]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
        {!isWatching ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🎁</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Limit Reached</h2>
            <p className="text-gray-500 mb-8">You've reached your free limit for this feature. Watch a short video to get 1 more scan, or upgrade for unlimited access.</p>
            
            <div className="space-y-3">
              <button 
                onClick={startWatching}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <span>Watch Video (+1 Scan)</span>
              </button>
              <button 
                className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                onClick={() => window.location.href = '/upgrade'}
              >
                Upgrade to Premium
              </button>
              <button 
                onClick={onClose}
                className="w-full py-2 text-gray-400 text-sm hover:text-gray-600"
              >
                Maybe later
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-black text-white min-h-[300px] flex flex-col items-center justify-center">
            <div className="text-6xl mb-6">📺</div>
            <h2 className="text-xl font-bold mb-2">Watching Advertisement</h2>
            <p className="text-gray-400 text-sm mb-8">Reward granted in {timeLeft}s</p>
            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-blue-500 h-full transition-all duration-1000 ease-linear"
                style={{ width: `${((15 - timeLeft) / 15) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
