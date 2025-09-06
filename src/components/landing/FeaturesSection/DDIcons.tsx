import React from 'react';

export const ScrollIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M6 4h12c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M8 8h8M8 12h8M8 16h6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="18" cy="6" r="2" fill="currentColor" opacity="0.6" />
  </svg>
);

export const DiceIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2L2 7v10l10 5 10-5V7l-10-5z"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="8" cy="10" r="1" fill="currentColor" />
    <circle cx="16" cy="10" r="1" fill="currentColor" />
    <circle cx="8" cy="14" r="1" fill="currentColor" />
    <circle cx="16" cy="14" r="1" fill="currentColor" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

export const WandIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 21l18-18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M19 5l2-2M17 7l2-2M15 9l2-2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="5" cy="19" r="2" stroke="currentColor" strokeWidth="2" fill="none" />
    <path
      d="M20 4l1-1M22 6l1-1"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
);

export const CrystalIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2l6 6-6 14-6-14 6-6z"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M6 8h12M9 12h6M10 16h4"
      stroke="currentColor"
      strokeWidth="1.5"
      opacity="0.6"
    />
    <circle cx="12" cy="6" r="1" fill="currentColor" />
  </svg>
);

export const BookIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M8 7h8M8 11h6M8 15h4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
);

export const ShieldIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M9 12l2 2 4-4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const DragonIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2C8 2 5 5 5 9c0 2 1 4 2 5l-2 3h4l2-2 2 2h4l-2-3c1-1 2-3 2-5 0-4-3-7-7-7z"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="9" cy="8" r="1" fill="currentColor" />
    <circle cx="15" cy="8" r="1" fill="currentColor" />
    <path
      d="M8 12c1 1 2 1 4 1s3 0 4-1"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M6 6l-2-2M18 6l2-2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const MapIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M9 3v15M15 6v15"
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle cx="7" cy="10" r="1" fill="currentColor" />
    <circle cx="17" cy="14" r="1" fill="currentColor" />
    <path
      d="M11 8l2 2-2 2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.6"
    />
  </svg>
);