const electron = require('electron');
const url = require('url');
const path = require('path');
const fs = require("fs");
var AutoLaunch = require('auto-launch');
const {mainMenu, trayMenu} = require('./menu');
const dataCollector = require('./dataCollector');

const {app, powerSaveBlocker, BrowserWindow, ipcMain} = electron;

powerSaveBlocker.start('prevent-app-suspension');

const iconLargePath = path.join(__dirname, 'assets/images/icon_large.png');

var agentAutoLauncher = new AutoLaunch({
    name: 'Cubed Server Agent',
});

agentAutoLauncher.enable();
agentAutoLauncher.isEnabled()
.then(function(isEnabled){
    if(isEnabled){
        return;
    }
    agentAutoLauncher.enable();
})
.catch(function(err){
    // handle error
});


let mainWindow;

// Listen for the app to be ready
app.on('ready', function(){
    
    serverkey_file = fs.readFileSync(path.join(__dirname, 'data/serverkey.txt'));
    serverkey = serverkey_file.toString();
    
    showOnStart = false;
    
    if(serverkey.length < 5) showOnStart = true;
    
    // Create main window
    mainWindow = new BrowserWindow({
        width: 500,
        height: 360,
        center: true,
        minimizable: false,
        maximizable: false,
        show: showOnStart,
        icon: iconLargePath
    });
    
    // Load HTML into main window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
    
    // Prevent quit on main window close
    mainWindow.on("close", function(e){
        e.sender.hide();
        e.preventDefault();
    });
    
    mainWindow.on("show", function(e){
        serverkey_file = fs.readFileSync(path.join(__dirname, 'data/serverkey.txt'));
        serverkey = serverkey_file.toString();
        
        gateway_file = fs.readFileSync(path.join(__dirname, 'data/gateway.txt'));
        gateway = gateway_file.toString();
        
        mainWindow.webContents.send("config:show", [serverkey, gateway]);
    });
    
    // Catch config:save
    ipcMain.on('config:save', function(e, [serverkey, gateway]) {
        mainWindow.webContents.send('config:save', [serverkey, gateway]);
        
        fs.writeFileSync(path.join(__dirname, 'data/serverkey.txt'), serverkey);
        fs.writeFileSync(path.join(__dirname, 'data/gateway.txt'), gateway);
    });
    
    
    // Main Window menu 
    mainMenu(mainWindow);

    trayMenu(mainWindow);
    
    // Do the job | run every 60 seconds
    setInterval(dataCollector, 60000);
});

app.on("before-quit", ev => {
    // BrowserWindow "close" event spawn after quit operation,
    // it requires to clean up listeners for "close" event
    mainWindow.removeAllListeners("close");
    
    // release mainWindow
    mainWindow = null;
});

process.on('uncaughtException', function (err) {
    console.log(err);
});

// Single Instance Check - prevent multiple running agents
var iShouldQuit = app.makeSingleInstance(function(commandLine, workingDirectory) {
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
    }
    return true;
});

if(iShouldQuit){
    app.quit();
    return;
}
