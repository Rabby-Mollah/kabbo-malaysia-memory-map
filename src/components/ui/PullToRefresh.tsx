'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RotateCw } from 'lucide-react';
import { soundEngine } from '@/utils/audio';

interface PullToRefreshProps {
  children: React.ReactNode;
}

export default function PullToRefresh({ children }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);

  const PULL_THRESHOLD = 70; // px to trigger reload

  useEffect(() => {
    let startY = 0;
    let activeScrollable: HTMLElement | null = null;

    const findScrollableParent = (el: HTMLElement | null): HTMLElement | null => {
      while (el && el !== document.body) {
        const overflowY = window.getComputedStyle(el).overflowY;
        if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
          return el;
        }
        el = el.parentElement;
      }
      return null;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (isRefreshing) return;
      startY = e.touches[0].clientY;
      touchStartY.current = startY;

      // Find if touch started inside a scrolled element
      activeScrollable = findScrollableParent(e.target as HTMLElement);
      // Only allow pulling if scrollable is at the very top
      if (activeScrollable && activeScrollable.scrollTop > 5) {
        isPulling.current = false;
        return;
      }

      isPulling.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;

      // If scrollable element was scrolled down, cancel pull
      if (activeScrollable && activeScrollable.scrollTop > 5) {
        isPulling.current = false;
        setPullDistance(0);
        return;
      }

      if (deltaY > 0) {
        // Apply rubber-band damping curve
        const distance = Math.min(100, Math.pow(deltaY, 0.82));
        setPullDistance(distance);

        // Prevent native overscroll glitching while pulling
        if (deltaY > 15 && e.cancelable && (!activeScrollable || activeScrollable.scrollTop <= 0)) {
          e.preventDefault();
        }
      } else {
        setPullDistance(0);
      }
    };

    const handleTouchEnd = () => {
      if (!isPulling.current) return;
      isPulling.current = false;

      if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(PULL_THRESHOLD);
        soundEngine?.playChime('click');

        // Smoothly reload the window
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        setPullDistance(0);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing]);

  return (
    <>
      {/* Visual Pull-to-Refresh Banner */}
      <div
        style={{
          transform: `translateY(${pullDistance > 0 ? pullDistance - 55 : -70}px)`,
          opacity: pullDistance > 10 || isRefreshing ? 1 : 0,
          transition: isPulling.current ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out',
        }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none select-none"
      >
        <div className="px-4 py-2 rounded-full bg-lotus-greenDeep/95 backdrop-blur-2xl border border-lotus-gold/50 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex items-center gap-2.5 text-xs text-lotus-cream font-medium">
          {/* Animated Lotus Icon / Refresh Spinner */}
          <div
            style={{
              transform: isRefreshing
                ? 'rotate(0deg)'
                : `rotate(${pullDistance * 4}deg)`,
            }}
            className={`w-6 h-6 rounded-full bg-lotus-gold/20 flex items-center justify-center text-sm transition-transform ${
              isRefreshing ? 'animate-spin' : ''
            }`}
          >
            {isRefreshing ? (
              <RotateCw className="w-3.5 h-3.5 text-lotus-gold" />
            ) : (
              <span>🌸</span>
            )}
          </div>

          <span className="text-[11px] font-serif tracking-wide text-lotus-blush">
            {isRefreshing
              ? 'Refreshing memory map...'
              : pullDistance >= PULL_THRESHOLD
              ? 'Release to refresh ✨'
              : 'Pull down to refresh'}
          </span>
        </div>
      </div>

      {children}
    </>
  );
}
