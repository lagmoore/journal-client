// src/main/preload.js
const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electron", {
  // Token management
  storeTokens: (data) => ipcRenderer.invoke("store-tokens", data),
  getTokens: (data) => ipcRenderer.invoke("get-tokens", data),
  deleteTokens: (data) => ipcRenderer.invoke("delete-tokens", data),

  // Settings management
  storeSettings: (settings) => ipcRenderer.invoke("store-settings", settings),
  getSettings: (key) => ipcRenderer.invoke("get-settings", key),

  // App info
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),

  // Theme management
  setTheme: (theme) => ipcRenderer.invoke("set-theme", theme),
  getTheme: () => ipcRenderer.invoke("get-theme"),
});
