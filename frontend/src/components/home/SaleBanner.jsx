import React, { useState, useEffect } from 'react';
import { saleBanner } from '../../data/mock';

const SaleBanner = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(saleBanner.endDate) - new Date();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          mins: Math.floor((difference / (1000 * 60)) % 60),
          secs: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num) => String(num).padStart(2, '0');

  return (
    <div className="bg-[#8B0000] text-white">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <div className="text-center">
            <span className="text-sm">{saleBanner.title} for </span>
            <span className="font-bold">{saleBanner.duration}</span>
            <div className="text-sm">
              Upto <span className="font-bold">{saleBanner.discount}</span> {saleBanner.subtitle}
            </div>
          </div>

          <div className="flex items-center gap-1 text-white/80">
            <span className="text-lg">|</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-xl font-bold">{formatNumber(timeLeft.days)}</div>
              <div className="text-xs text-white/70">days</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{formatNumber(timeLeft.hours)}</div>
              <div className="text-xs text-white/70">hrs</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{formatNumber(timeLeft.mins)}</div>
              <div className="text-xs text-white/70">mins</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{formatNumber(timeLeft.secs)}</div>
              <div className="text-xs text-white/70">secs</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleBanner;