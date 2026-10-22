import { useState } from 'react';

/**
 * Vehicle photo with a drawn fallback, so cards still look finished when the
 * photo cannot load (no network, broken link, or no URL saved).
 */
export default function VehicleImage({ vehicle, className = '' }) {
  const [failed, setFailed] = useState(false);
  const url = vehicle?.imageUrl || vehicle?.vehicleImage || vehicle?.image;
  const label = vehicle?.brand || (vehicle?.vehicleName ? vehicle.vehicleName.split(' ')[0] : '');
  const category = vehicle?.category || '';

  if (!url || failed) {
    return (
      <div className={`vimg vimg-fallback ${className}`} role="img" aria-label={`${label} illustration`}>
        <svg viewBox="0 0 240 110" className="vimg-car" aria-hidden="true">
          <path
            d="M10 76 C10 66 20 62 36 60 L62 42 C69 37 76 35 86 35 L152 35 C165 35 174 40 182 48 L208 56 C222 59 230 63 230 74 L230 80 L10 80 Z"
            fill="currentColor"
            opacity="0.9"
          />
          <path d="M68 54 L88 40 L114 40 L114 54 Z" fill="var(--vimg-glass)" />
          <path d="M122 40 L152 40 C160 40 166 44 172 54 L122 54 Z" fill="var(--vimg-glass)" />
          <circle cx="62" cy="82" r="15" fill="var(--vimg-wheel)" />
          <circle cx="62" cy="82" r="6" fill="currentColor" opacity="0.5" />
          <circle cx="186" cy="82" r="15" fill="var(--vimg-wheel)" />
          <circle cx="186" cy="82" r="6" fill="currentColor" opacity="0.5" />
        </svg>
        <span className="vimg-brand">{label}</span>
        {category && <span className="vimg-cat">{category}</span>}
      </div>
    );
  }

  return (
    <img
      className={`vimg ${className}`}
      src={url}
      alt={vehicle?.brand ? `${vehicle.brand} ${vehicle.model || ''}` : vehicle?.vehicleName || 'Vehicle'}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
