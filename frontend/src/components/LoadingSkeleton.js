import React from 'react';
import './LoadingSkeleton.css';

export const JobCardSkeleton = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-line skeleton-title"></div>
      <div className="skeleton-line skeleton-meta"></div>
      <div className="skeleton-line skeleton-text"></div>
      <div className="skeleton-line skeleton-text"></div>
      <div className="skeleton-tags">
        <div className="skeleton-tag"></div>
        <div className="skeleton-tag"></div>
        <div className="skeleton-tag"></div>
      </div>
      <div className="skeleton-button"></div>
    </div>
  );
};

export const StatCardSkeleton = () => {
  return (
    <div className="skeleton-stat-card">
      <div className="skeleton-line skeleton-stat-label"></div>
      <div className="skeleton-line skeleton-stat-value"></div>
    </div>
  );
};

export const ProfileSkeleton = () => {
  return (
    <div className="skeleton-profile">
      <div className="skeleton-line skeleton-title"></div>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="skeleton-form-group">
          <div className="skeleton-line skeleton-label"></div>
          <div className="skeleton-line skeleton-input"></div>
        </div>
      ))}
    </div>
  );
};
