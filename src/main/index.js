// src/main/index.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const keytar = require('keytar');
const Store = require('electron-store');

// Create a store for app settings
const store = new Store({
  encryptionKey: 'vyper-journal-secure-key',
  name: 'settings'
});

let mainWindow;

// Create window with security features
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      // Security settings
      sandbox: true,
      webSecurity: true,
    },
    // Set default background color to reduce flicker on load
    backgroundColor: '#f8fafc', // Light mode background
  });

  // Load the app
  mainWindow.loadURL(
    isDev 
      ? 'http://localhost:3000' 
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  // Open DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialize app when ready
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ----- IPC Handlers for secure token management ----- //

// Service name for keytar
const SERVICE = 'vyper-journal-auth';

// Store tokens securely
ipcMain.handle('store-tokens', async (event, { accessToken, refreshToken, userId }) => {
  try {
    // Store refresh token securely with keytar
    await keytar.setPassword(SERVICE, userId, refreshToken);
    
    // Store access token and expiry in memory or temporary store
    // (We avoid storing the access token to disk for security)
    return { success: true };
  } catch (error) {
    console.error('Error storing tokens:', error);
    return { success: false, error: error.message };
  }
});

// Retrieve tokens
ipcMain.handle('get-tokens', async (event, { userId }) => {
  try {
    // Get refresh token from secure storage
    const refreshToken = await keytar.getPassword(SERVICE, userId);
    return { success: true, refreshToken };
  } catch (error) {
    console.error('Error retrieving tokens:', error);
    return { success: false, error: error.message };
  }
});

// Delete tokens (logout)
ipcMain.handle('delete-tokens', async (event, { userId }) => {
  try {
    await keytar.deletePassword(SERVICE, userId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting tokens:', error);
    return { success: false, error: error.message };
  }
});

// Store user settings
ipcMain.handle('store-settings', async (event, settings) => {
  try {
    Object.entries(settings).forEach(([key, value]) => {
      store.set(key, value);
    });
    return { success: true };
  } catch (error) {
    console.error('Error storing settings:', error);
    return { success: false, error: error.message };
  }
});

// Get user settings
ipcMain.handle('get-settings', async (event, key) => {
  try {
    const value = store.get(key);
    return { success: true, value };
  } catch (error) {
    console.error('Error retrieving settings:', error);
    return { success: false, error: error.message };
  }
});