import React, { useState, useEffect, useRef } from 'react';
import LandingPage from './components/LandingPage';
import Toolbar from './components/Toolbar';
import AssetDrawer from './components/AssetDrawer';
import Canvas from './components/Canvas';
import ExportModal from './components/ExportModal';
import { useStore } from './store/useStore';

function App() {
  const { isAuthenticated, setAuthenticated } = useStore();
  const [isDrawerCollapsed, setIsDrawerCollapsed] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const fabricCanvasRef = useRef(null);

  // Auto-save functionality
  useEffect(() => {
    if (!isAuthenticated) return;

    const saveInterval = setInterval(() => {
      const state = useStore.getState();
      const saveData = {
        objects: state.objects,
        viewport: state.viewport,
      };
      
      localStorage.setItem('gpx-canvas-state', JSON.stringify(saveData));
      state.setLastSaved(Date.now());
    }, 5000); // Save every 5 seconds

    return () => clearInterval(saveInterval);
  }, [isAuthenticated]);

  // Load saved state on mount
  useEffect(() => {
    if (isAuthenticated) {
      const savedState = localStorage.getItem('gpx-canvas-state');
      if (savedState) {
        try {
          const data = JSON.parse(savedState);
          if (data.objects) {
            useStore.getState().setObjects(data.objects);
          }
          if (data.viewport) {
            useStore.getState().setViewport(data.viewport);
          }
        } catch (error) {
          console.error('Failed to load saved state:', error);
        }
      }
    }
  }, [isAuthenticated]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleKeyDown = (e) => {
      const state = useStore.getState();
      
      // Delete selected objects (Delete or Backspace)
      if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedObjects.length > 0) {
        // Don't delete if user is editing text
        if (document.activeElement.tagName === 'INPUT' || 
            document.activeElement.tagName === 'TEXTAREA') {
          return;
        }
        
        e.preventDefault();
        const socket = require('./utils/socket').socketService.getSocket();
        if (socket) {
          socket.emit('object:delete', state.selectedObjects);
        }
        state.deleteObjects(state.selectedObjects);
      }

      // Tool shortcuts
      if (e.key === 'v' || e.key === 'V') {
        state.setActiveTool('select');
      } else if (e.key === 't' || e.key === 'T') {
        state.setActiveTool('text');
      } else if (e.key === 'h' || e.key === 'H') {
        state.setActiveTool('pan');
      }

      // Escape to deselect
      if (e.key === 'Escape') {
        state.clearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated]);

  const handleAuthenticate = () => {
    setAuthenticated(true);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 4));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.1));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  const handleDelete = () => {
    const state = useStore.getState();
    if (state.selectedObjects.length > 0) {
      const socket = require('./utils/socket').socketService.getSocket();
      if (socket) {
        socket.emit('object:delete', state.selectedObjects);
      }
      state.deleteObjects(state.selectedObjects);
    }
  };

  if (!isAuthenticated) {
    return <LandingPage onAuthenticate={handleAuthenticate} />;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Toolbar
        onExport={handleExport}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onDelete={handleDelete}
        zoom={zoom}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <AssetDrawer
          isCollapsed={isDrawerCollapsed}
          onToggleCollapse={() => setIsDrawerCollapsed(!isDrawerCollapsed)}
        />
        
        <Canvas ref={fabricCanvasRef} />
      </div>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        fabricCanvas={fabricCanvasRef.current}
      />
    </div>
  );
}

export default App;
