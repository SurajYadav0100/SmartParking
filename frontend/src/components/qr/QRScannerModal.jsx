import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Modal } from '../common/Modal';
import { QrCode, Camera, AlertCircle, Search } from 'lucide-react';

export const QRScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const [manualInput, setManualInput] = useState('');
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerError, setScannerError] = useState(null);

  useEffect(() => {
    let html5QrcodeScanner = null;

    if (isOpen) {
      setScannerActive(true);
      setScannerError(null);

      // Give DOM time to mount modal container
      const timer = setTimeout(() => {
        try {
          const element = document.getElementById('qr-scanner-region');
          if (element) {
            html5QrcodeScanner = new Html5QrcodeScanner(
              'qr-scanner-region',
              {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
              },
              false
            );

            html5QrcodeScanner.render(
              (decodedText) => {
                // Clear scanner on success
                try {
                  html5QrcodeScanner.clear();
                } catch (e) {}
                onScanSuccess(decodedText);
                onClose();
              },
              (errorMessage) => {
                // Ignore standard frame scan errors
              }
            );
          }
        } catch (err) {
          console.warn('QR camera scanner init error:', err.message);
          setScannerError('Could not start video camera. You can enter Ticket ID manually below.');
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        if (html5QrcodeScanner) {
          try {
            html5QrcodeScanner.clear();
          } catch (e) {}
        }
      };
    }
  }, [isOpen]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScanSuccess(manualInput.trim());
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Scan Parking Ticket QR Code">
      <div className="space-y-4">
        <p className="text-xs text-slate-400">
          Point camera at the customer's digital parking ticket QR code, or type the Ticket ID manually.
        </p>

        {/* Video Scanner Container */}
        <div className="bg-slate-950 p-2 rounded-2xl border border-slate-800 overflow-hidden min-h-[280px] flex flex-col items-center justify-center">
          <div id="qr-scanner-region" className="w-full"></div>
          {scannerError && (
            <div className="p-4 text-center text-xs text-amber-400 flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {scannerError}
            </div>
          )}
        </div>

        {/* Manual Fallback Input */}
        <div className="pt-2 border-t border-slate-800">
          <span className="text-xs font-medium text-slate-400 block mb-2">
            Manual Ticket ID / Vehicle Number Lookup:
          </span>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. SP-2026-000123 or DL01AB1234"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 uppercase"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              Verify
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
};
