import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../configs/api";

export const fetchWorkspaces = createAsyncThunk(
  "workspace/fetchWorkspaces",
  async ({ getToken }) => {
    try {
      const token = await getToken();
      const { data } = await api.get("/api/workspaces", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data.workspaces || [];
    } catch (error) {
      console.log(error.message);
      return [];
    }
  }
);

const initialState = {
  workspaces: [],
  currentWorkspace: null,
  loading: false,
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setWorkspaces: (state, action) => {
      state.workspaces = action.payload;
    },
    setCurrentWorkspace: (state, action) => {
      localStorage.setItem("currentWorkspaceId", action.payload);
      state.currentWorkspace = state.workspaces.find((w) => w.id === action.payload);
    },
    addWorkspace: (state, action) => {
      state.workspaces.push(action.payload);
      state.currentWorkspace = action.payload; // Set new workspace as current
    },
    updateWorkspace: (state, action) => {
      state.workspaces = state.workspaces.map((w) =>
        w.id === action.payload.id ? action.payload : w
      );

      if (state.currentWorkspace?.id === action.payload.id) {
        state.currentWorkspace = action.payload;
      }
    },
    deleteWorkspace: (state, action) => {
      state.workspaces = state.workspaces.filter((w) => w.id !== action.payload);
    },
    addProject: (state, action) => {
      const workspace = state.currentWorkspace;
      workspace.projects.push(action.payload);

      state.workspaces = state.workspaces.map((w) =>
        w.id === workspace.id ? { ...workspace } : w
      );
    },
    addTask: (state, action) => {
      const workspace = state.currentWorkspace;
      workspace.projects = workspace.projects.map((p) =>
        p.id === action.payload.projectId
          ? { ...p, tasks: [...p.tasks, action.payload] }
          : p
      );
      state.workspaces = state.workspaces.map((w) =>
        w.id === workspace.id ? { ...workspace } : w
      );
    },
    updateTask: (state, action) => {
      const workspace = state.currentWorkspace;
      workspace.projects = workspace.projects.map((p) =>
        p.id === action.payload.projectId
          ? {
              ...p,
              tasks: p.tasks.map((t) =>
                t.id === action.payload.id ? action.payload : t
              ),
            }
          : p
      );
      state.workspaces = state.workspaces.map((w) =>
        w.id === workspace.id ? { ...workspace } : w
      );
    },
    deleteTask: (state, action) => {
      const workspace = state.currentWorkspace;
      workspace.projects = workspace.projects.map((p) => ({
        ...p,
        tasks: p.tasks.filter((t) => !action.payload.includes(t.id)),
      }));
      state.workspaces = state.workspaces.map((w) =>
        w.id === workspace.id ? { ...workspace } : w
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchWorkspaces.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchWorkspaces.fulfilled, (state, action) => {
      state.workspaces = action.payload;

      if (action.payload.length > 0) {
        const savedId = localStorage.getItem("currentWorkspaceId");
        const match = action.payload.find((w) => w.id === savedId);
        state.currentWorkspace = match || action.payload[0];
      } else {
        state.currentWorkspace = null;
      }
      state.loading = false;
    });

    builder.addCase(fetchWorkspaces.rejected, (state) => {
      state.loading = false;
    });
  },
});

export const {
  setWorkspaces,
  setCurrentWorkspace,
  addWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addProject,
  addTask,
  updateTask,
  deleteTask,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
