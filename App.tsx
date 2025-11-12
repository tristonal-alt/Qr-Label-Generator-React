
import React, { useState, useCallback } from 'react';
import QRCode from 'qrcode';
import { QrCodeDisplay } from './components/QrCodeDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { InputField } from './components/InputField';
import { validateAllFields, generateQRData } from './utils/validation';
import { DEFAULT_VALUES, QR_CODE_CONFIG, TEXT_SIZE_CONFIG, ERROR_MESSAGES } from './constants';
import type { DisplayData } from './types';

const App: React.FC = () => {
  const [stockCode, setStockCode] = useState<string>(DEFAULT_VALUES.STOCK_CODE);
  const [warehouse, setWarehouse] = useState<string>(DEFAULT_VALUES.WAREHOUSE);
  const [bin, setBin] = useState<string>(DEFAULT_VALUES.BIN);
  const [productClass, setProductClass] = useState<string>(DEFAULT_VALUES.PRODUCT_CLASS);

  const [qrCodeSize, setQrCodeSize] = useState<number>(QR_CODE_CONFIG.SIZE.DEFAULT);
  const [textSize, setTextSize] = useState<number>(TEXT_SIZE_CONFIG.DEFAULT);

  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [displayData, setDisplayData] = useState<DisplayData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    const formData: DisplayData = { stockCode, warehouse, bin, productClass };

    // Validate all fields
    const validation = validateAllFields(formData);
    if (!validation.isValid) {
      setError(validation.error);
      setQrCodeUrl('');
      setDisplayData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Generate QR data string
    const qrData = generateQRData(formData);

    try {
      const url = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: QR_CODE_CONFIG.ERROR_CORRECTION_LEVEL,
        type: 'image/png',
        margin: QR_CODE_CONFIG.MARGIN,
        width: qrCodeSize,
      });
      setQrCodeUrl(url);
      setDisplayData(formData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('QR Code generation failed:', error);
      setError(`${ERROR_MESSAGES.QR_GENERATION_FAILED} ${error.message}`);
      setQrCodeUrl('');
      setDisplayData(null);
    } finally {
      setIsLoading(false);
    }
  }, [stockCode, warehouse, bin, productClass, qrCodeSize]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Handle Enter key press to generate QR code
  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !isLoading) {
      handleGenerate();
    }
  }, [handleGenerate, isLoading]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center p-4 sm:p-6 font-sans">
      <main className="w-full max-w-2xl mx-auto flex flex-col items-center space-y-8">
        <header className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            QR Code Label Generator
          </h1>
          <p className="mt-2 text-slate-400">
            Enter data to generate a printable QR code label.
          </p>
        </header>

        <div
          className="w-full p-6 bg-slate-800 rounded-xl shadow-lg border border-slate-700 space-y-6"
          onKeyPress={handleKeyPress}
        >

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Stock Code"
              id="stock-code"
              value={stockCode}
              onChange={setStockCode}
              ariaLabel="Enter stock code"
            />
            <InputField
              label="Warehouse"
              id="warehouse"
              value={warehouse}
              onChange={setWarehouse}
              ariaLabel="Enter warehouse code"
            />
            <InputField
              label="Bin"
              id="bin"
              value={bin}
              onChange={setBin}
              ariaLabel="Enter bin location"
            />
            <InputField
              label="Product Class"
              id="product-class"
              value={productClass}
              onChange={setProductClass}
              ariaLabel="Enter product class"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-2">
              <label htmlFor="qr-size" className="text-sm font-medium text-slate-300 block">
                QR Code Size: <span className="font-bold">{qrCodeSize}px</span>
              </label>
              <input
                id="qr-size"
                type="range"
                min={QR_CODE_CONFIG.SIZE.MIN}
                max={QR_CODE_CONFIG.SIZE.MAX}
                step={QR_CODE_CONFIG.SIZE.STEP}
                value={qrCodeSize}
                onChange={(e) => setQrCodeSize(Number(e.target.value))}
                aria-label={`QR code size: ${qrCodeSize} pixels`}
                aria-valuemin={QR_CODE_CONFIG.SIZE.MIN}
                aria-valuemax={QR_CODE_CONFIG.SIZE.MAX}
                aria-valuenow={qrCodeSize}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="text-size" className="text-sm font-medium text-slate-300 block">
                Text Size: <span className="font-bold">{textSize}px</span>
              </label>
              <input
                id="text-size"
                type="range"
                min={TEXT_SIZE_CONFIG.MIN}
                max={TEXT_SIZE_CONFIG.MAX}
                step={TEXT_SIZE_CONFIG.STEP}
                value={textSize}
                onChange={(e) => setTextSize(Number(e.target.value))}
                aria-label={`Text size: ${textSize} pixels`}
                aria-valuemin={TEXT_SIZE_CONFIG.MIN}
                aria-valuemax={TEXT_SIZE_CONFIG.MAX}
                aria-valuenow={textSize}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>
          
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              aria-label="Generate QR code"
              aria-busy={isLoading}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-900 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  Generating...
                </>
              ) : (
                'Generate QR Code'
              )}
            </button>
            <button
              onClick={handlePrint}
              disabled={!qrCodeUrl}
              aria-label="Print QR code label"
              aria-disabled={!qrCodeUrl}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-slate-600 text-base font-medium rounded-md shadow-sm text-slate-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Print Label
            </button>
          </div>

          <p className="text-xs text-slate-400 text-center mt-2">
            Tip: Press Enter to generate QR code
          </p>
        </div>
        
        {qrCodeUrl && displayData && (
          <div className="w-full">
            <h2 className="text-center text-xl font-semibold mb-4 text-slate-300">Preview</h2>
            <div className="p-6 bg-slate-800 rounded-xl shadow-lg border border-slate-700">
                <QrCodeDisplay 
                    qrCodeUrl={qrCodeUrl} 
                    qrCodeSize={qrCodeSize}
                    textSize={textSize}
                    {...displayData} 
                />
            </div>
          </div>
        )}

      </main>

      <footer className="w-full max-w-2xl mx-auto text-center mt-12 text-slate-500 text-sm print:hidden">
        <p>Built with React, Tailwind CSS, and Gemini's guidance.</p>
      </footer>
    </div>
  );
};

export default App;
