'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, User, Heart, Calendar, Key, Database, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { TripProfile } from '@/types';
import { soundEngine } from '@/utils/audio';
import { getStoredImgBBKey, setStoredImgBBKey } from '@/utils/imgbb';
import { getSupabaseConfig, saveSupabaseConfig } from '@/utils/supabaseClient';

interface PersonalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: TripProfile;
  onSave: (profile: TripProfile) => void;
  onResetToSample: () => void;
  onClearToEmpty: () => void;
}

export default function PersonalizationModal({
  isOpen,
  onClose,
  profile,
  onSave,
  onResetToSample,
  onClearToEmpty,
}: PersonalizationModalProps) {
  const [friendName, setFriendName] = useState(profile.friendName);
  const [tripTitle, setTripTitle] = useState(profile.tripTitle);
  const [tripDates, setTripDates] = useState(profile.tripDates);
  const [subtitle, setSubtitle] = useState(profile.subtitle);
  const [dedicationMessage, setDedicationMessage] = useState(profile.dedicationMessage);

  // Cloud & API configuration
  const [imgbbKey, setImgbbKey] = useState('');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [cloudSaved, setCloudSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setImgbbKey(getStoredImgBBKey());
      const supa = getSupabaseConfig();
      setSupabaseUrl(supa.url);
      setSupabaseKey(supa.key);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine?.playChime('stamp');

    // Save Cloud Keys
    setStoredImgBBKey(imgbbKey);
    saveSupabaseConfig(supabaseUrl, supabaseKey);

    onSave({
      ...profile,
      friendName: friendName.trim() || 'My Friend',
      tripTitle: tripTitle.trim() || `${friendName.trim()}'s Malaysia`,
      tripDates: tripDates.trim() || 'October 2026',
      subtitle: subtitle.trim() || 'A little map of a big adventure.',
      dedicationMessage: dedicationMessage.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in text-lotus-cream select-none">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-lotus-forest/95 border border-lotus-rose/30 p-6 sm:p-8 shadow-glass-lg space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-lotus-rose/15 pb-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-lotus-gold">
              Keepsake Settings & Cloud
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-lotus-cream">
              Personalize & Cloud Access
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 flex items-center justify-center text-lotus-cream/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-lotus-cream/80">Recipient Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Kabbo"
              value={friendName}
              onChange={(e) => {
                setFriendName(e.target.value);
                setTripTitle(`${e.target.value}'s Malaysia`);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 border border-lotus-rose/25 text-lotus-cream text-sm focus:outline-none focus:border-lotus-gold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-lotus-cream/80">Trip Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Kabbo's Malaysia"
              value={tripTitle}
              onChange={(e) => setTripTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 border border-lotus-rose/25 text-lotus-cream text-sm focus:outline-none focus:border-lotus-gold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-lotus-cream/80">Trip Dates / Season</label>
              <input
                type="text"
                placeholder="e.g. October 2026"
                value={tripDates}
                onChange={(e) => setTripDates(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 border border-lotus-rose/25 text-lotus-cream text-sm focus:outline-none focus:border-lotus-gold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-lotus-cream/80">Subtitle</label>
              <input
                type="text"
                placeholder="A little map of a big adventure."
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/20 border border-lotus-rose/25 text-lotus-cream text-sm focus:outline-none focus:border-lotus-gold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-lotus-cream/80">Personal Dedication Message</label>
            <textarea
              rows={2}
              placeholder="A heartfelt message for her when she opens the gift..."
              value={dedicationMessage}
              onChange={(e) => setDedicationMessage(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-black/20 border border-lotus-rose/25 text-lotus-cream text-sm focus:outline-none focus:border-lotus-gold resize-none"
            />
          </div>

          {/* Cloud & API Keys Integration */}
          <div className="p-4 rounded-2xl bg-white/5 border border-lotus-rose/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-lotus-gold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>Cloud Storage & ImgBB Access</span>
              </span>
              <span className="text-[10px] text-lotus-blush font-medium">Active</span>
            </div>

            {/* ImgBB API Key */}
            <div className="space-y-1">
              <label className="text-[11px] text-lotus-cream/70 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-lotus-rose" />
                  <span>ImgBB API Key (https://api.imgbb.com/)</span>
                </span>
              </label>
              <input
                type="text"
                placeholder="Paste ImgBB API key..."
                value={imgbbKey}
                onChange={(e) => setImgbbKey(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-lotus-forest border border-lotus-rose/25 text-lotus-cream text-xs focus:outline-none focus:border-lotus-gold font-mono"
              />
            </div>

            {/* Supabase URL & Key */}
            <div className="space-y-1">
              <label className="text-[11px] text-lotus-cream/70 flex items-center gap-1">
                <Key className="w-3 h-3 text-lotus-gold" />
                <span>Supabase URL & Anon Key</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="https://xyz.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-lotus-forest border border-lotus-rose/25 text-lotus-cream text-[11px] focus:outline-none focus:border-lotus-gold font-mono"
                />
                <input
                  type="password"
                  placeholder="Supabase Anon Key..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-lotus-forest border border-lotus-rose/25 text-lotus-cream text-[11px] focus:outline-none focus:border-lotus-gold font-mono"
                />
              </div>
            </div>
          </div>

          {/* Quick Demo Helpers for Requirement 22 Empty State & Default Trip */}
          <div className="pt-2 border-t border-lotus-rose/15 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-lotus-cream/50 block">
              Trip Data Modes
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Load sample trip memories for Kabbo?')) {
                    onResetToSample();
                    onClose();
                  }
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-lotus-cream text-xs font-medium transition-colors"
              >
                Restore Sample Trip
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Clear all memories to test the Empty State flow?')) {
                    onClearToEmpty();
                    onClose();
                  }
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-lotus-rose/20 hover:bg-lotus-rose/30 text-lotus-blush border border-lotus-rose/30 text-xs font-medium transition-colors"
              >
                Clear to Empty State
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-lotus-rose/15">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-lotus-cream/60 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-lotus-gold to-lotus-stamenGold text-lotus-forest font-bold text-xs shadow-gold-glow hover:opacity-95 transition-all"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
