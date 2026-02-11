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
  const alignmentLinesRef = useRef([]);
  const isPanningRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

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
    zoom,
    setZoom,
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

    // Mouse wheel zoom
    canvas.on('mouse:wheel', (opt) => {
      const delta = opt.e.deltaY;
      let newZoom = canvas.getZoom();
      newZoom *= 0.999 ** delta;
      
      // Clamp zoom between 10% and 500%
      if (newZoom > 5) newZoom = 5;
      if (newZoom < 0.1) newZoom = 0.1;
      
      // Zoom to mouse position
      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, newZoom);
      
      // Update zoom in store
      setZoom(Math.round(newZoom * 100));
      
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    // Pan with mouse (when pan tool active or space key held)
    canvas.on('mouse:down', (opt) => {
      const evt = opt.e;
      
      // Enable panning if pan tool is active OR space key is held
      if (activeTool === 'pan' || evt.shiftKey || isPanningWithSpace()) {
        isPanningRef.current = true;
        canvas.selection = false;
        lastPosRef.current = { x: evt.clientX, y: evt.clientY };
        canvas.defaultCursor = 'grabbing';
      }
    });

    canvas.on('mouse:move', (opt) => {
      const socket = socketService.getSocket();
      if (socket && opt.pointer) {
        socket.emit('cursor:move', { x: opt.pointer.x, y: opt.pointer.y });
      }

      if (isPanningRef.current) {
        const evt = opt.e;
        const vpt = canvas.viewportTransform;
        vpt[4] += evt.clientX - lastPosRef.current.x;
        vpt[5] += evt.clientY - lastPosRef.current.y;
        canvas.requestRenderAll();
        lastPosRef.current = { x: evt.clientX, y: evt.clientY };
      }
    });

    canvas.on('mouse:up', () => {
      isPanningRef.current = false;
      canvas.selection = activeTool === 'select';
      canvas.defaultCursor = activeTool === 'pan' ? 'grab' : 'default';
    });

    // Initialize socket connection
    const socket = socketService.connect();

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
      clearAlignmentLines(canvas);
      if (socket) {
        socket.emit('object:select', []);
      }
    });

    canvas.on('object:moving', (e) => {
      showAlignmentLines(canvas, e.target);
    });

    canvas.on('object:modified', (e) => {
      clearAlignmentLines(canvas);
      if (e.target && e.target.id) {
        const obj = fabricObjectToData(e.target);
        if (socket) {
          socket.emit('object:update', obj);
        }
      }
    });

    // Keyboard shortcuts
    const handleKeyDown = (e) => {
      // Delete key
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObjects.length > 0) {
        e.preventDefault();
        selectedObjects.forEach(id => {
          const obj = canvas.getObjects().find(o => o.id === id);
          if (obj) canvas.remove(obj);
        });
        canvas.renderAll();
        
        if (socket) {
          socket.emit('object:delete', selectedObjects);
        }
        setSelectedObjects([]);
      }

      // Escape to deselect
      if (e.key === 'Escape') {
        canvas.discardActiveObject();
        canvas.renderAll();
      }

      // Space bar for temporary pan
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        canvas.defaultCursor = 'grab';
      }
    };

    const handleKeyUp = (e) => {
      // Release space bar pan
      if (e.code === 'Space') {
        canvas.defaultCursor = activeTool === 'pan' ? 'grab' : 'default';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.dispose();
      socketService.disconnect();
    };
  }, []);

  // Helper to check if space key is held
  const isPanningWithSpace = () => {
    return document.querySelector('body').classList.contains('space-held');
  };

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

  // Update canvas zoom when zoom changes from toolbar
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      const zoomLevel = zoom / 100;
      const center = canvas.getCenter();
      canvas.zoomToPoint(new fabric.Point(center.left, center.top), zoomLevel);
      canvas.renderAll();
    }
  }, [zoom]);

  // Alignment guide functions
  const showAlignmentLines = (canvas, target) => {
    clearAlignmentLines(canvas);
    
    const canvasObjects = canvas.getObjects().filter(obj => obj !== target && obj.id);
    const targetBounds = target.getBoundingRect();
    const targetCenterX = targetBounds.left + targetBounds.width / 2;
    const targetCenterY = targetBounds.top + targetBounds.height / 2;
    
    const threshold = 5; // pixels threshold for snapping
    
    canvasObjects.forEach(obj => {
      const objBounds = obj.getBoundingRect();
      const objCenterX = objBounds.left + objBounds.width / 2;
      const objCenterY = objBounds.top + objBounds.height / 2;
      
      // Vertical center alignment
      if (Math.abs(targetCenterX - objCenterX) < threshold) {
        const line = new fabric.Line([objCenterX, 0, objCenterX, canvas.height * 5], {
          stroke: '#FF00FF',
          strokeWidth: 1 / canvas.getZoom(),
          selectable: false,
          evented: false,
          strokeDashArray: [5, 5]
        });
        canvas.add(line);
        alignmentLinesRef.current.push(line);
        
        target.left = obj.left + (obj.width * obj.scaleX) / 2 - (target.width * target.scaleX) / 2;
        target.setCoords();
      }
      
      // Horizontal center alignment
      if (Math.abs(targetCenterY - objCenterY) < threshold) {
        const line = new fabric.Line([0, objCenterY, canvas.width * 5, objCenterY], {
          stroke: '#FF00FF',
          strokeWidth: 1 / canvas.getZoom(),
          selectable: false,
          evented: false,
          strokeDashArray: [5, 5]
        });
        canvas.add(line);
        alignmentLinesRef.current.push(line);
        
        target.top = obj.top + (obj.height * obj.scaleY) / 2 - (target.height * target.scaleY) / 2;
        target.setCoords();
      }
      
      // Left edge alignment
      if (Math.abs(targetBounds.left - objBounds.left) < threshold) {
        const line = new fabric.Line([objBounds.left, 0, objBounds.left, canvas.height * 5], {
          stroke: '#FF00FF',
          strokeWidth: 1 / canvas.getZoom(),
          selectable: false,
          evented: false,
          strokeDashArray: [5, 5]
        });
        canvas.add(line);
        alignmentLinesRef.current.push(line);
        
        target.left = obj.left;
        target.setCoords();
      }
      
      // Right edge alignment
      if (Math.abs(targetBounds.left + targetBounds.width - (objBounds.left + objBounds.width)) < threshold) {
        const line = new fabric.Line([
          objBounds.left + objBounds.width, 
          0, 
          objBounds.left + objBounds.width, 
          canvas.height * 5
        ], {
          stroke: '#FF00FF',
          strokeWidth: 1 / canvas.getZoom(),
          selectable: false,
          evented: false,
          strokeDashArray: [5, 5]
        });
        canvas.add(line);
        alignmentLinesRef.current.push(line);
        
        target.left = obj.left + (obj.width * obj.scaleX) - (target.width * target.scaleX);
        target.setCoords();
      }
      
      // Top edge alignment
      if (Math.abs(targetBounds.top - objBounds.top) < threshold) {
        const line = new fabric.Line([0, objBounds.top, canvas.width * 5, objBounds.top], {
          stroke: '#FF00FF',
          strokeWidth: 1 / canvas.getZoom(),
          selectable: false,
          evented: false,
          strokeDashArray: [5, 5]
        });
        canvas.add(line);
        alignmentLinesRef.current.push(line);
        
        target.top = obj.top;
        target.setCoords();
      }
      
      // Bottom edge alignment
      if (Math.abs(targetBounds.top + targetBounds.height - (objBounds.top + objBounds.height)) < threshold) {
        const line = new fabric.Line([
          0, 
          objBounds.top + objBounds.height, 
          canvas.width * 5, 
          objBounds.top + objBounds.height
        ], {
          stroke: '#FF00FF',
          strokeWidth: 1 / canvas.getZoom(),
          selectable: false,
          evented: false,
          strokeDashArray: [5, 5]
        });
        canvas.add(line);
        alignmentLinesRef.current.push(line);
        
        target.top = obj.top + (obj.height * obj.scaleY) - (target.height * target.scaleY);
        target.setCoords();
      }
    });
    
    canvas.renderAll();
  };

  const clearAlignmentLines = (canvas) => {
    alignmentLinesRef.current.forEach(line => {
      canvas.remove(line);
    });
    alignmentLinesRef.current = [];
    canvas.renderAll();
  };

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
    if (!canvas) return;

    const data = e.dataTransfer.getData('application/json');
    if (!data) return;

    const asset = JSON.parse(data);
    const rect = containerRef.current.getBoundingClientRect();
    
    // Convert screen coordinates to canvas coordinates accounting for zoom and pan
    const pointer = canvas.getPointer(e, true);

    const newObject = {
      id: uuidv4(),
      type: 'asset',
      assetName: asset.file,
      position: { x: pointer.x, y: pointer.y },
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
