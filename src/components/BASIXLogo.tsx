/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import bonaLogo from '../assets/bona_logo.png';

export default function BASIXLogo({ className = 'h-10' }: { className?: string }) {
  return (
    <img
      src={bonaLogo}
      alt="Bona Electronic Solutions"
      className={`object-contain select-none ${className}`}
    />
  );
}
