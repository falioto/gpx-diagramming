import React, { useState } from 'react';

const ASSETS = [
  { name: 'start', category: 'Flow Control', file: 'start.png' },
  { name: 'end', category: 'Flow Control', file: 'end.png' },
  { name: 'start hold', category: 'Flow Control', file: 'start hold.png' },
  { name: 'end hold', category: 'Flow Control', file: 'end hold.png' },
  { name: 'Action step', category: 'Steps', file: 'Action step.png' },
  { name: 'caution step', category: 'Steps', file: 'caution step.png' },
  { name: 'assemble', category: 'Operations', file: 'assemble.png' },
  { name: 'collect', category: 'Operations', file: 'collect.png' },
  { name: 'connect', category: 'Operations', file: 'connect.png' },
  { name: 'decompose', category: 'Operations', file: 'decompose.png' },
  { name: 'integrate', category: 'Operations', file: 'integrate.png' },
  { name: 'transform', category: 'Operations', file: 'transform.png' },
  { name: 'assess', category: 'Analysis', file: 'assess.png' },
  { name: 'inputs', category: 'Analysis', file: 'inputs.png' },
  { name: 'readiness', category: 'Analysis', file: 'readiness.png' },
  { name: 'caution', category: 'Warnings', file: 'caution.png' },
  { name: 'lethal', category: 'Warnings', file: 'lethal.png' },
  { name: 'stop', category: 'Warnings', file: 'stop.png' },
  { name: 'power on', category: 'Power', file: 'power on.png' },
  { name: 'power off', category: 'Power', file: 'power off.png' },
  { name: 'tool', category: 'Tools', file: 'tool.png' },
];

function AssetDrawer({ onAssetDragStart, isCollapsed, onToggleCollapse }) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(ASSETS.map(a => a.category))];

  const filteredAssets = selectedCategory === 'All' 
    ? ASSETS 
    : ASSETS.filter(a => a.category === selectedCategory);

  const handleDragStart = (e, asset) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify(asset));
    onAssetDragStart && onAssetDragStart(asset);
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-white border-r border-gray-200 flex flex-col items-center py-4 shadow-md">
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Expand drawer"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-md">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Assets</h2>
        <button
          onClick={onToggleCollapse}
          className="p-1 hover:bg-gray-100 rounded transition"
          title="Collapse drawer"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Category Filter */}
      <div className="p-3 border-b border-gray-200">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Asset Grid */}
      <div className="flex-1 overflow-y-auto asset-drawer p-3">
        <div className="grid grid-cols-2 gap-3">
          {filteredAssets.map((asset, index) => (
            <div
              key={index}
              draggable
              onDragStart={(e) => handleDragStart(e, asset)}
              className="aspect-square bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-indigo-400 hover:shadow-md transition cursor-move flex items-center justify-center p-2 group"
              title={asset.name}
            >
              <img
                src={`/assets/${asset.file}`}
                alt={asset.name}
                className="max-w-full max-h-full object-contain pointer-events-none"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-600">
          💡 Drag and drop assets onto the canvas
        </p>
      </div>
    </div>
  );
}

export default AssetDrawer;
