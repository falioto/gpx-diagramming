const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

// Fixed CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    // Allow Netlify and localhost domains
    const allowedOrigins = [
      'https://gpxdiagramming.netlify.app',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:4200'
    ];
    
    if (allowedOrigins.some(allowed => origin.startsWith(allowed)) || 
        origin.includes('netlify.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

// Apply CORS to Express
app.use(cors(corsOptions));
app.use(express.json());

// Configure Socket.IO with CORS
const io = socketIo(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling'], // Explicitly set transports
  allowEIO3: true // Allow Engine.IO v3 clients
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'GPX Diagramming Server',
    version: '1.0.0',
    socketio: 'enabled',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Canvas state and user management
const canvasState = {
  objects: [],
  viewport: { zoom: 1, panX: 0, panY: 0 }
};

const users = new Map();
const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  '#F8B88B', '#FAD02C'
];
let colorIndex = 0;

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
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
    canvasState.objects = canvasState.objects.filter(
      obj => !objectIds.includes(obj.id)
    );
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
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
