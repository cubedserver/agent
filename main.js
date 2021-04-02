const electron = require('electron');
const path = require('path');
var AutoLaunch = require('auto-launch');
const {mainMenu, trayMenu} = require('./menu');
const dataCollector = require('./data-collector');
const {app, powerSaveBlocker, BrowserWindow} = electron;
const globalShortcut = electron.globalShortcut
const contextMenu = require('electron-context-menu');
const config = require('./config');

contextMenu();

powerSaveBlocker.start('prevent-app-suspension');

const iconLargePath = path.join(__dirname, 'static/icon.png');

var agentAutoLauncher = new AutoLaunch({
    name: 'Cubed Server Agent',
});

agentAutoLauncher.enable();
agentAutoLauncher.isEnabled()
.then((isEnabled) => {
    if(isEnabled){
        return;
    }
    agentAutoLauncher.enable();
})
.catch((err) => {
    // handle error
});

// Prevent window from being garbage collected
let mainWindow;

const createMainWindow = () => {
    // Create main window
    const win = new BrowserWindow({
        width: 600,
        height: 500,
        center: true,
        minimizable: false,
        maximizable: false,
        icon: iconLargePath,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        }
    });

    globalShortcut.register('CommandOrControl+R', function() {
        win.reload()
    });

    // Load HTML into main window
    win.loadFile(path.join(__dirname, 'index.html'));

    // Prevent quit on main window close
    win.on("close", (e) => {
        e.sender.hide();
        e.preventDefault();
    });

    win.on('ready-to-show', () => {

    });

    // Open the DevTools.
    // win.webContents.openDevTools()

    return win;
}

app.on("before-quit", (ev) => {
    // release mainWindow
    mainWindow = null;
});

process.on('uncaughtException', (err) => {
    console.log(err);
});

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
    app.quit();
}

app.on('second-instance', () => {
    if (mainWindow) {
        if (mainWindow.isMinimized()) {
            mainWindow.restore();
        }

        mainWindow.show();
    }
});

app.on('window-all-closed', () => {
    if ((process.platform !== 'darwin')) {
        app.quit();
    }
});

app.on('activate', () => {
    if (!mainWindow) {
        mainWindow = createMainWindow();
    }
});

app.whenReady().then(() => {
    mainWindow = createMainWindow();

    mainMenu(mainWindow);
    trayMenu(mainWindow);

    // Do the job | run every 60 seconds
    setInterval(() => {
        dataCollector(mainWindow);
    }, 60000);
});
