import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // Authentication
  isAuthenticated: false,
  setAuthenticated: (value) => set({ isAuthenticated: value }),

  // Canvas objects
  objects: [],
  setObjects: (objects) => set({ objects }),
  addObject: (object) => set((state) => ({ objects: [...state.objects, object] })),
  updateObject: (id, updates) => set((state) => ({
    objects: state.objects.map(obj => obj.id === id ? { ...obj, ...updates } : obj)
  })),
  deleteObjects: (ids) => set((state) => ({
    objects: state.objects.filter(obj => !ids.includes(obj.id)),
    selectedObjects: state.selectedObjects.filter(id => !ids.includes(id))
  })),

  // Selection
  selectedObjects: [],
  setSelectedObjects: (ids) => set({ selectedObjects: ids }),
  clearSelection: () => set({ selectedObjects: [] }),

  // Tool state
  activeTool: 'select', // 'select', 'text', 'pan'
  setActiveTool: (tool) => set({ activeTool: tool }),

  // Viewport
  viewport: {
    zoom: 1,
    panX: 0,
    panY: 0
  },
  setViewport: (viewport) => set({ viewport }),
  updateViewport: (updates) => set((state) => ({
    viewport: { ...state.viewport, ...updates }
  })),

  // Collaboration
  users: [],
  setUsers: (users) => set({ users }),
  updateUser: (user) => set((state) => ({
    users: state.users.map(u => u.id === user.id ? user : u)
  })),
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  removeUser: (userId) => set((state) => ({
    users: state.users.filter(u => u.id !== userId)
  })),
  currentUserId: null,
  setCurrentUserId: (id) => set({ currentUserId: id }),

  // Text editing
  editingTextId: null,
  setEditingTextId: (id) => set({ editingTextId: id }),

  // Auto-save
  lastSaved: null,
  setLastSaved: (timestamp) => set({ lastSaved: timestamp }),
  isSaving: false,
  setIsSaving: (value) => set({ isSaving: value }),

  // History for undo/redo (future feature)
  history: [],
  historyIndex: -1,

  // Get selected objects
  getSelectedObjects: () => {
    const state = get();
    return state.objects.filter(obj => state.selectedObjects.includes(obj.id));
  }
}));
