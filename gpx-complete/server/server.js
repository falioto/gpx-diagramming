const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

// CORS configuration - allow your Netlify domain
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow any netlify.app domain and localhost
    if (origin.includes('netlify.app') || origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

const io = socketIo(server, {
  cors: corsOptions
});

app.use(cors(corsOptions));
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'GPX Diagramming Server', 
    version: '1.0.0',
    socketio: 'enabled'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// In-memory storage for canvas state
const canvasState = {
  objects: [],
  viewport: {
    zoom: 1,
    panX: 0,
    panY: 0
  }
};

// Connected users
const users = new Map();

// User colors for cursors
const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  '#F8B88B', '#FAD02C'
];

let colorIndex = 0;

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Assign user info
  const user = {
    id: socket.id,
    name: `User ${users.size + 1}`,
    color: colors[colorIndex % colors.length]
  };
  colorIndex++;
  users.set(socket.id, user);

  // Send initial state to new user
  socket.emit('canvas:init', {
    canvasState,
    users: Array.from(users.values()),
    yourId: socket.id
  });

  // Notify others about new user
  socket.broadcast.emit('user:joined', user);

  // Handle cursor movement
  socket.on('cursor:move', (cursor) => {
    socket.broadcast.emit('cursor:update', {
      userId: socket.id,
      cursor
    });
  });

  // Handle object creation
  socket.on('object:create', (object) => {
    canvasState.objects.push(object);
    socket.broadcast.emit('object:created', object);
  });

  // Handle object updates
  socket.on('object:update', (object) => {
    const index = canvasState.objects.findIndex(o => o.id === object.id);
    if (index !== -1) {
      canvasState.objects[index] = object;
      socket.broadcast.emit('object:updated', object);
    }
  });

  // Handle object deletion
  socket.on('object:delete', (objectIds) => {
    canvasState.objects = canvasState.objects.filter(
      obj => !objectIds.includes(obj.id)
    );
    socket.broadcast.emit('object:deleted', objectIds);
  });

  // Handle selection
  socket.on('object:select', (objectIds) => {
    socket.broadcast.emit('selection:changed', {
      userId: socket.id,
      objectIds
    });
  });

  // Handle viewport changes
  socket.on('viewport:update', (viewport) => {
    canvasState.viewport = viewport;
    socket.broadcast.emit('viewport:updated', viewport);
  });

  // Handle disconnection
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
  console.log(`Socket.io CORS enabled for netlify.app domains`);
});
