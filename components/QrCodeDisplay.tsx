
import React from 'react';
import type { QrCodeDisplayProps } from '../types';
import { ELEMENT_IDS } from '../constants';

export const QrCodeDisplay: React.FC<QrCodeDisplayProps> = React.memo(({
  qrCodeUrl,
  stockCode,
  warehouse,
  bin,
  productClass,
  qrCodeSize,
  textSize
}) => {
  return (
    // This div is targeted by the @media print CSS rule in index.css
    <div id={ELEMENT_IDS.PRINTABLE_AREA} className="flex flex-col items-center justify-center p-4 bg-white rounded-lg">
      <img
        id={ELEMENT_IDS.QR_CODE_IMAGE}
        src={qrCodeUrl}
        alt={`QR Code for StockCode: ${stockCode}`}
        style={{ width: `${qrCodeSize}px`, height: `${qrCodeSize}px` }}
        className="max-w-full h-auto object-contain"
      />
      <div
        className="mt-4 text-left font-mono break-words text-black px-2 space-y-1 w-full"
        style={{ fontSize: `${textSize}px`, maxWidth: `${qrCodeSize}px` }}
      >
        <p><span className="font-semibold">StockCode:</span> {stockCode}</p>
        <p><span className="font-semibold">Warehouse:</span> {warehouse}</p>
        <p><span className="font-semibold">Bin:</span> {bin}</p>
        <p><span className="font-semibold">ProductClass:</span> {productClass}</p>
      </div>
    </div>
  );
});
