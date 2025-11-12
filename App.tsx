
import React, { useState, useCallback } from 'react';
import QRCode from 'qrcode';
import { QrCodeDisplay } from './components/QrCodeDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';

interface DisplayData {
  stockCode: string;
  warehouse: string;
  bin: string;
  productClass: string;
}

const App: React.FC = () => {
  const [stockCode, setStockCode] = useState<string>('TEST-SKU-001');
  const [warehouse, setWarehouse] = useState<string>('MAIN-WH');
  const [bin, setBin] = useState<string>('A1-R2-S3');
  const [productClass, setProductClass] = useState<string>('Electronics');
  
  const [qrCodeSize, setQrCodeSize] = useState<number>(250);
  const [textSize, setTextSize] = useState<number>(14);

  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [displayData, setDisplayData] = useState<DisplayData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!stockCode.trim() || !warehouse.trim() || !bin.trim() || !productClass.trim()) {
      setError('All fields are required.');
      setQrCodeUrl('');
      setDisplayData(null);
      return;
    }
    setIsLoading(true);
    setError(null);

    const qrData = `[S]${stockCode}[W]${warehouse}[B]${bin}[P]${productClass}`;

    try {
      const url = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 1,
        width: qrCodeSize,
      });
      setQrCodeUrl(url);
      setDisplayData({ stockCode, warehouse, bin, productClass });
    } catch (err) {
      console.error('QR Code generation failed:', err);
      setError('Failed to generate QR code. Please try again.');
      setQrCodeUrl('');
      setDisplayData(null);
    } finally {
      setIsLoading(false);
    }
  }, [stockCode, warehouse, bin, productClass, qrCodeSize]);

  const handlePrint = () => {
    window.print();
  };
  
  const renderInputField = (label: string, id: string, value: string, setter: (val: string) => void) => (
      <div className="space-y-2">
        <label htmlFor={id} className="text-sm font-medium text-slate-300">
          {label}
        </label>
        <input
          type="text"
          id={id}
          value={value}
          onChange={(e) => setter(e.target.value)}
          className="w-full p-3 bg-slate-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow duration-200 text-slate-200 placeholder-slate-500"
        />
      </div>
  )

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

        <div className="w-full p-6 bg-slate-800 rounded-xl shadow-lg border border-slate-700 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {renderInputField("StockCode", "stock-code", stockCode, setStockCode)}
            {renderInputField("Warehouse", "warehouse", warehouse, setWarehouse)}
            {renderInputField("Bin", "bin", bin, setBin)}
            {renderInputField("ProductClass", "product-class", productClass, setProductClass)}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-2">
                <label htmlFor="qr-size" className="text-sm font-medium text-slate-300 block">QR Code Size: <span className="font-bold">{qrCodeSize}px</span></label>
                <input
                    id="qr-size"
                    type="range"
                    min="100"
                    max="500"
                    step="10"
                    value={qrCodeSize}
                    onChange={(e) => setQrCodeSize(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
            </div>
            <div className="space-y-2">
                <label htmlFor="text-size" className="text-sm font-medium text-slate-300 block">Text Size: <span className="font-bold">{textSize}px</span></label>
                <input
                    id="text-size"
                    type="range"
                    min="8"
                    max="24"
                    step="1"
                    value={textSize}
                    onChange={(e) => setTextSize(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
            </div>
          </div>
          
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
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
              className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-slate-600 text-base font-medium rounded-md shadow-sm text-slate-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Print Label
            </button>
          </div>
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
