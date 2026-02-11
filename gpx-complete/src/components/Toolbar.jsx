import React from 'react';
import { useStore } from '../store/useStore';

function Toolbar() {
  const { 
    activeTool, 
    setActiveTool, 
    zoom, 
    setZoom,
    isSaving,
    setShowExportModal 
  } = useStore();

  const tools = [
    { id: 'select', icon: '↖', label: 'Select (V)', shortcut: 'V' },
    { id: 'text', icon: 'T', label: 'Text (T)', shortcut: 'T' },
    { id: 'pan', icon: '✋', label: 'Pan (H)', shortcut: 'H' },
  ];

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 10, 500);
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 10, 10);
    setZoom(newZoom);
  };

  const handleZoomReset = () => {
    setZoom(100);
  };

  const handleZoomToFit = () => {
    // This would require calculating all objects' bounds
    // For now, just reset to 100%
    setZoom(100);
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      {/* Left: Tools */}
      <div className="flex items-center gap-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`
              px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${activeTool === tool.id 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
            title={tool.label}
          >
            <span className="text-lg">{tool.icon}</span>
          </button>
        ))}
      </div>

      {/* Center: Zoom Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleZoomOut}
          className="px-2 py-1 text-gray-600 hover:text-gray-800 font-bold text-lg"
          title="Zoom Out"
        >
          −
        </button>
        
        <button
          onClick={handleZoomReset}
          className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded min-w-[60px]"
          title="Reset Zoom (Click to reset to 100%)"
        >
          {zoom}%
        </button>
        
        <button
          onClick={handleZoomIn}
          className="px-2 py-1 text-gray-600 hover:text-gray-800 font-bold text-lg"
          title="Zoom In"
        >
          +
        </button>

        <div className="h-4 w-px bg-gray-300 mx-1"></div>

        <button
          onClick={handleZoomToFit}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
          title="Zoom to Fit"
        >
          Fit
        </button>
      </div>

      {/* Right: Save Status & Export */}
      <div className="flex items-center gap-3">
        {/* Save Status */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {isSaving ? (
            <>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Saved</span>
            </>
          )}
        </div>

        {/* Export Button */}
        <button
          onClick={() => setShowExportModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
        >
          Export
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
