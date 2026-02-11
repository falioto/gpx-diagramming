import React from 'react';
import { useStore } from '../store/useStore';

function Toolbar({ onExport, onZoomIn, onZoomOut, onResetZoom, zoom }) {
  const { activeTool, setActiveTool, isSaving, lastSaved } = useStore();

  const tools = [
    { id: 'select', icon: 'cursor', label: 'Select (V)' },
    { id: 'text', icon: 'text', label: 'Text (T)' },
    { id: 'pan', icon: 'hand', label: 'Pan (H)' },
  ];

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const renderIcon = (iconType) => {
    switch (iconType) {
      case 'cursor':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
        );
      case 'text':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        );
      case 'hand':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm">
      {/* Left: Logo and Tools */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">GPX</span>
          </div>
          <span className="font-semibold text-gray-800 hidden sm:inline">GPX Diagramming</span>
        </div>

        <div className="h-8 w-px bg-gray-300"></div>

        {/* Tool Buttons */}
        <div className="flex items-center space-x-1">
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`p-2 rounded-lg transition ${
                activeTool === tool.id
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={tool.label}
            >
              {renderIcon(tool.icon)}
            </button>
          ))}
        </div>

        <div className="h-8 w-px bg-gray-300"></div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onZoomOut}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            title="Zoom out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button
            onClick={onResetZoom}
            className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded transition min-w-[60px]"
            title="Reset zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={onZoomIn}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            title="Zoom in"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Right: Save Status and Export */}
      <div className="flex items-center space-x-4">
        {/* Save Status */}
        <div className="flex items-center space-x-2 text-sm">
          {isSaving ? (
            <>
              <svg className="animate-spin h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-600">Saving...</span>
            </>
          ) : (
            <>
              <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600">
                {lastSaved ? `Saved ${getTimeAgo(lastSaved)}` : 'Saved'}
              </span>
            </>
          )}
        </div>

        {/* Export Button */}
        <button
          onClick={onExport}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-medium flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Export</span>
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
