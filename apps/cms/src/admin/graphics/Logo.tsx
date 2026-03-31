import React from 'react'
import Image from 'next/image'

export const Logo: React.FC = () => (
  <div className="logo-container">
    <Image
      src="/branding/logo-full-light.png"
      alt="LinkTrend Logo"
      width={180}
      height={48}
      className="logo-light"
      priority
    />
    <Image
      src="/branding/logo-full-dark.png"
      alt="LinkTrend Logo"
      width={180}
      height={48}
      className="logo-dark"
      priority
    />
    <style>
      {`
        .logo-container {
          max-width: 180px;
          height: auto;
          display: flex;
          align-items: center;
        }
        .logo-container img {
          width: 100%;
          height: auto;
          display: none;
        }
        
        /* Show light logo by default (for light mode) */
        .logo-light {
          display: block;
        }
        .logo-dark {
          display: none;
        }

        /* Show dark logo in dark mode */
        [data-theme="dark"] .logo-light {
          display: none;
        }
        [data-theme="dark"] .logo-dark {
          display: block;
        }
      `}
    </style>
  </div>
)

export default Logo
