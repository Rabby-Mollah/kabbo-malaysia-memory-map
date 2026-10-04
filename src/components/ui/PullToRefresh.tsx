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
  const touchStartX = useRef(0);
  const isPulling = useRef(false);

  const PULL_THRESHOLD = 95; // px to trigger reload

  useEffect(() => {
    let startY = 0;
    let startX = 0;
    let activeScrollable: HTMLElement | null = null;

    const isInteractiveOrMap = (target: HTMLElement | null): boolean => {
      if (!target) return false;
      return !!target.closest(
        '.leaflet-container, .leaflet-pane, .leaflet-tile, .leaflet-control, .leaflet-marker-icon, canvas, [data-map-viewport], [data-map-container], [data-no-pull-refresh], button, a, input, select, textarea, [role="button"], [role="dialog"]'
      );
    };

    const findScrollableParent = (el: HTMLElement | null): HTMLElement | null => {
      let current = el;
      while (current && current !== document.body && current !== document.documentElement) {
        // Never treat map containers or canvas viewports as scrollable parents
        if (
          current.classList.contains('leaflet-container') ||
          current.tagName.toLowerCase() === 'canvas' ||
          current.getAttribute('data-map-viewport') ||
          current.getAttribute('data-map-container')
        ) {
          return null;
        }

        const style = window.getComputedStyle(current);
        const overflowY = style.overflowY;
        if (
          (overflowY === 'auto' || overflowY === 'scroll') &&
          current.scrollHeight > current.clientHeight + 15
        ) {
          return current;
        }
        current = current.parentElement;
      }
      return null;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (isRefreshing) return;

      // Strictly single-finger gesture (ignore pinch-to-zoom gestures)
      if (e.touches.length !== 1) {
        isPulling.current = false;
        setPullDistance(0);
        return;
      }

      const target = e.target as HTMLElement | null;

      // Never activate if touch starts inside map, canvas, button, or dialog
      if (isInteractiveOrMap(target)) {
        isPulling.current = false;
        return;
      }

      // Check if touch is within an active scrollable list/view (e.g. Journey Timeline, Gallery)
      const scrollable = findScrollableParent(target);

      // Pull-to-refresh ONLY allowed inside an actual scrollable container that is at the very top (scrollTop <= 2)
      // On non-scrollable views (like the map viewport), pull-to-refresh MUST NOT activate
      if (!scrollable || scrollable.scrollTop > 2) {
        isPulling.current = false;
        return;
      }

      activeScrollable = scrollable;
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
      touchStartY.current = startY;
      touchStartX.current = startX;
      isPulling.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current || isRefreshing) return;

      // Immediately cancel if a second finger touches the screen (pinch zoom)
      if (e.touches.length !== 1) {
        isPulling.current = false;
        setPullDistance(0);
        return;
      }

      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const deltaY = currentY - startY;
      const deltaX = currentX - startX;

      // If user scrolls up or container scrolled down, cancel
      if (activeScrollable && activeScrollable.scrollTop > 2) {
        isPulling.current = false;
        setPullDistance(0);
        return;
      }

      // If motion is horizontal or diagonal (swiping sideways or diagonal pinch), cancel
      if (Math.abs(deltaX) > Math.abs(deltaY) * 0.55) {
        isPulling.current = false;
        setPullDistance(0);
        return;
      }

      // 45px initial deadzone: small slips or micro-drags do not trigger any pull visual
      if (deltaY > 45) {
        const pullTravel = deltaY - 45;
        // Firm damping resistance: requires ~170px of deliberate downward drag to reach threshold
        const distance = Math.min(115, Math.pow(pullTravel, 0.78) * 2.1);
        setPullDistance(distance);

        if (distance > 30 && e.cancelable) {
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

    const handleTouchCancel = () => {
      isPulling.current = false;
      setPullDistance(0);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchCancel);
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
