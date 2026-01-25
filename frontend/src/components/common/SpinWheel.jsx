import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const SpinWheel = ({ onClose }) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);

  const prizes = [
    { text: '₹400 OFF', color: '#0ea5e9' },
    { text: 'No luck today', color: '#2D2D2D' },
    { text: '₹300 OFF', color: '#0ea5e9' },
    { text: 'Almost', color: '#2D2D2D' },
    { text: 'FREE SHIPPING', color: '#0ea5e9' },
    { text: 'Nothing', color: '#2D2D2D' },
    { text: '₹500 OFF', color: '#0ea5e9' },
    { text: 'Sorry!', color: '#2D2D2D' }
  ];

  const spin = () => {
    if (spinning) return;
    
    setSpinning(true);
    const winningIndex = Math.floor(Math.random() * prizes.length);
    const spins = 5; // Number of full rotations
    const segmentAngle = 360 / prizes.length;
    const targetRotation = spins * 360 + (prizes.length - winningIndex) * segmentAngle - segmentAngle / 2;
    
    setRotation(targetRotation);
    
    setTimeout(() => {
      setSpinning(false);
      setResult(prizes[winningIndex]);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {!result ? (
          <>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-serif text-gray-900 mb-2">
                Spin the wheel to get up to ₹500 OFF
              </h3>
              <p className="text-sm text-gray-500">
                92% offers claimed. Hurry up!
              </p>
            </div>

            {/* Wheel */}
            <div className="relative w-64 h-64 mx-auto mb-6">
              <div
                className="w-full h-full rounded-full border-4 border-gray-900 overflow-hidden transition-transform duration-[4000ms] ease-out"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                {prizes.map((prize, index) => {
                  const angle = (360 / prizes.length) * index;
                  return (
                    <div
                      key={index}
                      className="absolute w-1/2 h-1/2 origin-bottom-right"
                      style={{
                        transform: `rotate(${angle}deg) skewY(${90 - 360 / prizes.length}deg)`,
                        backgroundColor: prize.color
                      }}
                    />
                  );
                })}
              </div>
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-gray-900" />
            </div>

            <button
              onClick={spin}
              disabled={spinning}
              className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white font-bold text-lg rounded-lg transition-colors disabled:opacity-50"
            >
              {spinning ? 'Spinning...' : 'Try your luck'}
            </button>

            <p className="text-xs text-gray-400 text-center mt-4">
              *If you win you can claim your coupon for 10 min only!
            </p>
          </>
        ) : (
          <div className="text-center py-8">
            <h3 className="text-2xl font-serif text-gray-900 mb-4">
              {result.text.includes('₹') || result.text === 'FREE SHIPPING'
                ? `Hurray! You've won ${result.text}!`
                : result.text}
            </h3>
            {(result.text.includes('₹') || result.text === 'FREE SHIPPING') && (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Applicable on orders above ₹1000+ only
                </p>
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-1">Coupon Code:</p>
                  <p className="text-xl font-bold text-gray-900">SPIN{Math.random().toString(36).substring(7).toUpperCase()}</p>
                </div>
              </>
            )}
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpinWheel;