import React, { useState } from 'react';
import { jsPDF } from 'jspdf';

function ExportModal({ isOpen, onClose, fabricCanvas }) {
  const [format, setFormat] = useState('png');
  const [scale, setScale] = useState(2);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    if (!fabricCanvas) return;

    setIsExporting(true);

    try {
      if (format === 'png') {
        // Export as PNG
        const dataURL = fabricCanvas.toDataURL({
          format: 'png',
          quality: 1,
          multiplier: scale,
        });

        const link = document.createElement('a');
        link.download = `gpx-diagram-${Date.now()}.png`;
        link.href = dataURL;
        link.click();
      } else if (format === 'pdf') {
        // Export as PDF
        const dataURL = fabricCanvas.toDataURL({
          format: 'png',
          quality: 1,
          multiplier: 2,
        });

        const canvasWidth = fabricCanvas.getWidth();
        const canvasHeight = fabricCanvas.getHeight();
        
        // Calculate PDF dimensions (A4 landscape or custom)
        const pdf = new jsPDF({
          orientation: canvasWidth > canvasHeight ? 'landscape' : 'portrait',
          unit: 'px',
          format: [canvasWidth, canvasHeight],
        });

        pdf.addImage(dataURL, 'PNG', 0, 0, canvasWidth, canvasHeight);
        pdf.save(`gpx-diagram-${Date.now()}.pdf`);
      }

      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Export Diagram</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormat('png')}
                className={`p-4 border-2 rounded-lg transition ${
                  format === 'png'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">🖼️</div>
                  <div className="font-semibold">PNG</div>
                  <div className="text-xs text-gray-600">Raster Image</div>
                </div>
              </button>
              <button
                onClick={() => setFormat('pdf')}
                className={`p-4 border-2 rounded-lg transition ${
                  format === 'pdf'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">📄</div>
                  <div className="font-semibold">PDF</div>
                  <div className="text-xs text-gray-600">Document</div>
                </div>
              </button>
            </div>
          </div>

          {/* Scale Selection (PNG only) */}
          {format === 'png' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Resolution
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map(s => (
                  <button
                    key={s}
                    onClick={() => setScale(s)}
                    className={`py-2 px-4 border-2 rounded-lg transition ${
                      scale === s
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-600">
                Higher resolution = larger file size
              </p>
            </div>
          )}

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition ${
              isExporting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isExporting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </span>
            ) : (
              `Export as ${format.toUpperCase()}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExportModal;
