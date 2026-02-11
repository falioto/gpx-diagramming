const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

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

// User colors for collaboration
const USER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
  '#98D8C8', '#FFD93D', '#6BCF7F', '#C77DFF',
  '#FF8FA3', '#74C0FC'
];

let colorIndex = 0;

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Assign user color
  const userColor = USER_COLORS[colorIndex % USER_COLORS.length];
  colorIndex++;

  // Create user object
  const user = {
    id: socket.id,
    name: `User ${users.size + 1}`,
    color: userColor,
    cursor: { x: 0, y: 0 },
    selectedObjects: []
  };

  users.set(socket.id, user);

  // Send current canvas state to new user
  socket.emit('canvas:init', {
    canvasState,
    users: Array.from(users.values()),
    yourId: socket.id
  });

  // Broadcast new user to others
  socket.broadcast.emit('user:joined', user);

  // Handle user name change
  socket.on('user:changeName', (name) => {
    const user = users.get(socket.id);
    if (user) {
      user.name = name;
      users.set(socket.id, user);
      io.emit('user:updated', user);
    }
  });

  // Handle cursor movement
  socket.on('cursor:move', (cursor) => {
    const user = users.get(socket.id);
    if (user) {
      user.cursor = cursor;
      users.set(socket.id, user);
      socket.broadcast.emit('cursor:update', {
        userId: socket.id,
        cursor
      });
    }
  });

  // Handle object creation
  socket.on('object:create', (object) => {
    const newObject = {
      ...object,
      id: object.id || uuidv4()
    };
    canvasState.objects.push(newObject);
    io.emit('object:created', newObject);
  });

  // Handle object update
  socket.on('object:update', (updatedObject) => {
    const index = canvasState.objects.findIndex(obj => obj.id === updatedObject.id);
    if (index !== -1) {
      canvasState.objects[index] = updatedObject;
      socket.broadcast.emit('object:updated', updatedObject);
    }
  });

  // Handle object deletion
  socket.on('object:delete', (objectIds) => {
    const idsArray = Array.isArray(objectIds) ? objectIds : [objectIds];
    
    canvasState.objects = canvasState.objects.filter(
      obj => !idsArray.includes(obj.id)
    );
    
    io.emit('object:deleted', idsArray);
  });

  // Handle object selection
  socket.on('object:select', (objectIds) => {
    const user = users.get(socket.id);
    if (user) {
      user.selectedObjects = Array.isArray(objectIds) ? objectIds : [objectIds];
      users.set(socket.id, user);
      socket.broadcast.emit('user:selection', {
        userId: socket.id,
        selectedObjects: user.selectedObjects
      });
    }
  });

  // Handle viewport changes
  socket.on('viewport:update', (viewport) => {
    // Don't sync viewport between users, each has their own view
    // This is just for potential future features
  });

  // Handle grouping
  socket.on('object:group', (objectIds) => {
    const groupId = uuidv4();
    const group = {
      id: groupId,
      type: 'group',
      position: { x: 0, y: 0 },
      rotation: 0,
      zIndex: Math.max(...canvasState.objects.map(o => o.zIndex || 0)) + 1,
      children: objectIds
    };

    // Remove grouped objects from main array and add to group
    const groupedObjects = canvasState.objects.filter(obj => 
      objectIds.includes(obj.id)
    );
    
    canvasState.objects = canvasState.objects.filter(obj => 
      !objectIds.includes(obj.id)
    );
    
    canvasState.objects.push(group);
    
    io.emit('object:grouped', { group, groupedObjects });
  });

  // Handle ungrouping
  socket.on('object:ungroup', (groupId) => {
    const group = canvasState.objects.find(obj => obj.id === groupId);
    if (group && group.type === 'group') {
      canvasState.objects = canvasState.objects.filter(obj => obj.id !== groupId);
      io.emit('object:ungrouped', groupId);
    }
  });

  // Handle canvas clear
  socket.on('canvas:clear', () => {
    canvasState.objects = [];
    io.emit('canvas:cleared');
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    users.delete(socket.id);
    io.emit('user:left', socket.id);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    users: users.size,
    objects: canvasState.objects.length 
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
