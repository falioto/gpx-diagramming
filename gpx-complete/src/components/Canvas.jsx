import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { useStore } from '../store/useStore';
import { socketService } from '../utils/socket';
import { v4 as uuidv4 } from 'uuid';

function Canvas() {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const [remoteCursors, setRemoteCursors] = useState([]);

  const {
    objects,
    setObjects,
    addObject,
    updateObject,
    deleteObjects,
    selectedObjects,
    setSelectedObjects,
    activeTool,
    users,
    currentUserId,
    setCurrentUserId,
    setUsers,
    updateUser,
    addUser,
    removeUser,
    viewport,
    updateViewport,
  } = useStore();

  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth - 256,
      height: window.innerHeight - 64,
      backgroundColor: '#f5f5f5',
      selection: activeTool === 'select',
    });

    fabricCanvasRef.current = canvas;

    // Handle window resize
    const handleResize = () => {
      canvas.setWidth(window.innerWidth - 256);
      canvas.setHeight(window.innerHeight - 64);
      canvas.renderAll();
    };

    window.addEventListener('resize', handleResize);

    // Initialize socket connection
    const socket = socketService.connect();

    // Listen for initial canvas state
    socket.on('canvas:init', ({ canvasState, users, yourId }) => {
      console.log('Canvas initialized:', canvasState);
      setCurrentUserId(yourId);
      setUsers(users);
      
      if (canvasState.objects && canvasState.objects.length > 0) {
        canvasState.objects.forEach(obj => {
          addObjectToCanvas(obj);
        });
      }
    });

    socket.on('user:joined', (user) => {
      addUser(user);
    });

    socket.on('user:left', (userId) => {
      removeUser(userId);
      setRemoteCursors(prev => prev.filter(c => c.userId !== userId));
    });

    socket.on('cursor:update', ({ userId, cursor }) => {
      setRemoteCursors(prev => {
        const existing = prev.find(c => c.userId === userId);
        if (existing) {
          return prev.map(c => c.userId === userId ? { ...c, cursor } : c);
        }
        return [...prev, { userId, cursor }];
      });
    });

    socket.on('object:created', (object) => {
      addObjectToCanvas(object);
    });

    socket.on('object:updated', (object) => {
      updateObjectOnCanvas(object);
    });

    socket.on('object:deleted', (objectIds) => {
      objectIds.forEach(id => {
        const obj = canvas.getObjects().find(o => o.id === id);
        if (obj) {
          canvas.remove(obj);
        }
      });
      canvas.renderAll();
    });

    // Canvas event handlers
    canvas.on('mouse:move', (e) => {
      if (socket && e.pointer) {
        socket.emit('cursor:move', { x: e.pointer.x, y: e.pointer.y });
      }
    });

    canvas.on('selection:created', (e) => {
      const selectedIds = e.selected.map(obj => obj.id).filter(Boolean);
      setSelectedObjects(selectedIds);
      if (socket && selectedIds.length > 0) {
        socket.emit('object:select', selectedIds);
      }
    });

    canvas.on('selection:updated', (e) => {
      const selectedIds = e.selected.map(obj => obj.id).filter(Boolean);
      setSelectedObjects(selectedIds);
      if (socket && selectedIds.length > 0) {
        socket.emit('object:select', selectedIds);
      }
    });

    canvas.on('selection:cleared', () => {
      setSelectedObjects([]);
      if (socket) {
        socket.emit('object:select', []);
      }
    });

    canvas.on('object:modified', (e) => {
      if (e.target && e.target.id) {
        const obj = fabricObjectToData(e.target);
        if (socket) {
          socket.emit('object:update', obj);
        }
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
      socketService.disconnect();
    };
  }, []);

  // Update canvas selection mode based on active tool
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      canvas.selection = activeTool === 'select';
      canvas.defaultCursor = activeTool === 'pan' ? 'grab' : 'default';
      
      canvas.forEachObject(obj => {
        obj.selectable = activeTool === 'select';
      });
      
      canvas.renderAll();
    }
  }, [activeTool]);

  // Sync deletions from store to canvas
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const canvasObjectIds = canvas.getObjects().map(obj => obj.id).filter(Boolean);
    const storeObjectIds = objects.map(obj => obj.id);
    const idsToRemove = canvasObjectIds.filter(id => !storeObjectIds.includes(id));
    
    if (idsToRemove.length > 0) {
      idsToRemove.forEach(id => {
        const obj = canvas.getObjects().find(o => o.id === id);
        if (obj) {
          canvas.remove(obj);
        }
      });
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  }, [objects]);

  // Helper functions
  const fabricObjectToData = (fabricObj) => {
    return {
      id: fabricObj.id,
      type: fabricObj.customType || 'asset',
      assetName: fabricObj.assetName,
      position: { x: fabricObj.left, y: fabricObj.top },
      scale: fabricObj.scaleX,
      rotation: fabricObj.angle,
      zIndex: fabricObj.zIndex || 0,
      text: fabricObj.text,
      fontSize: fabricObj.fontSize,
      fontWeight: fabricObj.fontWeight,
      fontStyle: fabricObj.fontStyle,
      textColor: fabricObj.fill,
      width: fabricObj.width,
    };
  };

  const addObjectToCanvas = (obj) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (obj.type === 'asset' && obj.assetName) {
      fabric.Image.fromURL(`/assets/${obj.assetName}`, (img) => {
        img.set({
          id: obj.id,
          customType: 'asset',
          assetName: obj.assetName,
          left: obj.position.x,
          top: obj.position.y,
          scaleX: obj.scale || 1,
          scaleY: obj.scale || 1,
          angle: obj.rotation || 0,
          lockScalingFlip: true,
          lockUniScaling: false,
          selectable: activeTool === 'select',
        });
        canvas.add(img);
        canvas.renderAll();
      });
    } else if (obj.type === 'text') {
      const text = new fabric.Textbox(obj.text || 'New Text', {
        id: obj.id,
        customType: 'text',
        left: obj.position.x,
        top: obj.position.y,
        fontSize: obj.fontSize || 16,
        fontWeight: obj.fontWeight || 'normal',
        fontStyle: obj.fontStyle || 'normal',
        fill: obj.textColor || '#000000',
        width: obj.width || 200,
        selectable: activeTool === 'select',
      });
      canvas.add(text);
      canvas.renderAll();
    }
  };

  const updateObjectOnCanvas = (obj) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const fabricObj = canvas.getObjects().find(o => o.id === obj.id);
    if (fabricObj) {
      fabricObj.set({
        left: obj.position.x,
        top: obj.position.y,
        scaleX: obj.scale,
        scaleY: obj.scale,
        angle: obj.rotation,
      });
      canvas.renderAll();
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const canvas = fabricCanvasRef.current;
    if (!canvas || activeTool !== 'select') return;

    const data = e.dataTransfer.getData('application/json');
    if (!data) return;

    const asset = JSON.parse(data);
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newObject = {
      id: uuidv4(),
      type: 'asset',
      assetName: asset.file,
      position: { x, y },
      scale: 1,
      rotation: 0,
      zIndex: objects.length,
    };

    addObjectToCanvas(newObject);
    
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('object:create', newObject);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleCanvasClick = (e) => {
    if (activeTool === 'text') {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      const pointer = canvas.getPointer(e);
      const newText = {
        id: uuidv4(),
        type: 'text',
        text: 'Double-click to edit',
        position: { x: pointer.x, y: pointer.y },
        fontSize: 16,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textColor: '#000000',
        width: 200,
        rotation: 0,
        zIndex: objects.length,
      };

      addObjectToCanvas(newText);
      
      const socket = socketService.getSocket();
      if (socket) {
        socket.emit('object:create', newText);
      }
      
      useStore.getState().setActiveTool('select');
    }
  };

  const renderRemoteCursors = () => {
    return remoteCursors.map(({ userId, cursor }) => {
      const user = users.find(u => u.id === userId);
      if (!user || userId === currentUserId) return null;

      return (
        <div
          key={userId}
          className="remote-cursor"
          style={{
            left: cursor.x,
            top: cursor.y,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M3 3L17 10L10 11L8 17L3 3Z"
              fill={user.color}
              stroke="white"
              strokeWidth="1.5"
            />
          </svg>
          <div
            className="remote-cursor-label"
            style={{ backgroundColor: user.color }}
          >
            {user.name}
          </div>
        </div>
      );
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-hidden"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleCanvasClick}
    >
      <canvas ref={canvasRef} />
      {renderRemoteCursors()}
    </div>
  );
}

export default Canvas;
