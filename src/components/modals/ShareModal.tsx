'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Lock, Globe, Key, ShieldCheck, Share2 } from 'lucide-react';
import { TripProfile } from '@/types';
import { soundEngine } from '@/utils/audio';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: TripProfile;
  onUpdatePrivacy: (privacy: 'private' | 'link' | 'password', password?: string) => void;
}

export default function ShareModal({
  isOpen,
  onClose,
  profile,
  onUpdatePrivacy,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [privacy, setPrivacy] = useState<'private' | 'link' | 'password'>(profile.privacy || 'link');
  const [password, setPassword] = useState(profile.password || '');

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareLink = `${currentUrl}/?view=story&traveler=${encodeURIComponent(
    profile.friendName.toLowerCase()
  )}`;

  const handleCopy = () => {
    soundEngine?.playChime('click');
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    soundEngine?.playChime('stamp');
    onUpdatePrivacy(privacy, password);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in text-lotus-cream select-none">
      <div className="relative w-full max-w-lg rounded-3xl bg-lotus-forest/95 border border-lotus-rose/30 p-6 sm:p-8 shadow-glass-lg space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-lotus-rose/15 pb-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-lotus-gold">
              Keepsake Sharing
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-lotus-cream">
              Share {profile.friendName}&apos;s Story
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 flex items-center justify-center text-lotus-cream/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Link Preview Box */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-lotus-cream/80">Read-Only Keepsake Link</label>
          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-black/20 border border-lotus-rose/20">
            <input
              type="text"
              readOnly
              value={shareLink}
              className="bg-transparent text-xs text-lotus-cream/90 flex-1 truncate outline-none select-all"
            />
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 rounded-xl bg-lotus-rose hover:bg-lotus-rose/90 text-lotus-cream text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-lotus-gold" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <p className="text-[11px] text-lotus-cream/60">
            Anyone viewing this link sees a read-only 3D interactive version without editing controls.
          </p>
        </div>

        {/* Privacy Selector */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-lotus-cream/80 block">
            Access Privacy Setting
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            {/* Anyone with link */}
            <button
              type="button"
              onClick={() => setPrivacy('link')}
              className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                privacy === 'link'
                  ? 'bg-lotus-pine border-lotus-gold ring-2 ring-lotus-gold/30 text-lotus-cream'
                  : 'bg-white/5 border-lotus-rose/15 text-lotus-cream/70 hover:bg-white/10'
              }`}
            >
              <Globe className="w-5 h-5 text-lotus-gold shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold block text-lotus-cream">Anyone with link</span>
                <span className="text-[11px] text-lotus-cream/60">
                  Visible to anyone who receives the private secret link.
                </span>
              </div>
            </button>

            {/* Password protected */}
            <button
              type="button"
              onClick={() => setPrivacy('password')}
              className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                privacy === 'password'
                  ? 'bg-lotus-pine border-lotus-gold ring-2 ring-lotus-gold/30 text-lotus-cream'
                  : 'bg-white/5 border-lotus-rose/15 text-lotus-cream/70 hover:bg-white/10'
              }`}
            >
              <Key className="w-5 h-5 text-lotus-gold shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-xs font-bold block text-lotus-cream">Password Protected</span>
                <span className="text-[11px] text-lotus-cream/60">
                  Requires a secret passphrase to enter the keepsake.
                </span>
                {privacy === 'password' && (
                  <input
                    type="text"
                    placeholder="Set secret passphrase..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 w-full px-3 py-1.5 rounded-xl bg-lotus-forest border border-lotus-rose/30 text-lotus-cream text-xs outline-none focus:border-lotus-gold"
                  />
                )}
              </div>
            </button>

            {/* Private Only */}
            <button
              type="button"
              onClick={() => setPrivacy('private')}
              className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                privacy === 'private'
                  ? 'bg-lotus-pine border-lotus-gold ring-2 ring-lotus-gold/30 text-lotus-cream'
                  : 'bg-white/5 border-lotus-rose/15 text-lotus-cream/70 hover:bg-white/10'
              }`}
            >
              <Lock className="w-5 h-5 text-lotus-rose shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold block text-lotus-cream">Private (Device Only)</span>
                <span className="text-[11px] text-lotus-cream/60">
                  Accessible only on this personal device.
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Save CTA */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-lotus-rose/15">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-lotus-cream/60 hover:text-lotus-cream"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-lotus-gold to-lotus-stamenGold text-lotus-forest font-bold text-xs shadow-gold-glow hover:opacity-95 transition-all"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
