import React from 'react'
import Image from 'next/image'

export const Icon: React.FC = () => (
  <div className="icon-container">
    <Image
      src="/branding/logo-icon-light.png"
      alt="LinkTrend Icon"
      width={32}
      height={32}
      className="icon-light"
      priority
    />
    <Image
      src="/branding/logo-icon-dark.png"
      alt="LinkTrend Icon"
      width={32}
      height={32}
      className="icon-dark"
      priority
    />
    <style>
      {`
        .icon-container {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .icon-container img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: none;
        }
        
        /* Show light icon by default */
        .icon-light {
          display: block;
        }
        .icon-dark {
          display: none;
        }

        /* Show dark icon in dark mode */
        [data-theme="dark"] .icon-light {
          display: none;
        }
        [data-theme="dark"] .icon-dark {
          display: block;
        }
      `}
    </style>
  </div>
)

export default Icon
