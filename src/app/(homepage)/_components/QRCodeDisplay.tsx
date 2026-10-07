"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Image from "next/image";

interface QRCodeDisplayProps {
  url: string;
  size?: number;
  className?: string;
}

export const QRCodeDisplay = ({
  url,
  size = 80,
  className = "",
}: QRCodeDisplayProps) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;

    QRCode.toDataURL(url, {
      width: size * 3,
      margin: 1,
      color: {
        dark: "#18181B",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    })
      .then((res) => setDataUrl(res))
      .catch((err) => console.error("QR Code Generation Error:", err));
  }, [url, size]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`shrink-0 rounded-lg bg-neutral-100 border border-neutral-200 animate-pulse ${className}`}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 rounded-lg overflow-hidden border border-neutral-200 bg-white p-1 ${className}`}
    >
      <Image
        src={dataUrl}
        alt="Scan QR code to download Zedu on Google Play"
        width={size}
        height={size}
        className="h-full w-full object-contain"
        unoptimized
      />
    </div>
  );
};
