const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

// Simple CORS - allow everything
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

const io = socketIo(server, {
  cors: {
    origin: true,
    credentials: true
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ status: 'GPX Diagramming Server Running', version: '1.0.0' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Canvas state
const canvasState = { objects: [], viewport: { zoom: 1, panX: 0, panY: 0 } };
const users = new Map();
const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
let colorIndex = 0;

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  const user = {
    id: socket.id,
    name: `User ${users.size + 1}`,
    color: colors[colorIndex % colors.length]
  };
  colorIndex++;
  users.set(socket.id, user);

  socket.emit('canvas:init', {
    canvasState,
    users: Array.from(users.values()),
    yourId: socket.id
  });

  socket.broadcast.emit('user:joined', user);

  socket.on('cursor:move', (cursor) => {
    socket.broadcast.emit('cursor:update', { userId: socket.id, cursor });
  });

  socket.on('object:create', (object) => {
    canvasState.objects.push(object);
    socket.broadcast.emit('object:created', object);
  });

  socket.on('object:update', (object) => {
    const index = canvasState.objects.findIndex(o => o.id === object.id);
    if (index !== -1) {
      canvasState.objects[index] = object;
      socket.broadcast.emit('object:updated', object);
    }
  });

  socket.on('object:delete', (objectIds) => {
    canvasState.objects = canvasState.objects.filter(obj => !objectIds.includes(obj.id));
    socket.broadcast.emit('object:deleted', objectIds);
  });

  socket.on('object:select', (objectIds) => {
    socket.broadcast.emit('selection:changed', { userId: socket.id, objectIds });
  });

  socket.on('viewport:update', (viewport) => {
    canvasState.viewport = viewport;
    socket.broadcast.emit('viewport:updated', viewport);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    users.delete(socket.id);
    socket.broadcast.emit('user:left', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
