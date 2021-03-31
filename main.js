const electron = require('electron');
const url = require('url');
const path = require('path');
const sysinfo = require('systeminformation');
const fs = require("fs");
var AutoLaunch = require('auto-launch');
var request = require('request');


const {app, Tray, Menu, powerSaveBlocker, BrowserWindow, ipcMain} = electron;
powerSaveBlocker.start('prevent-app-suspension');

const iconPath = path.join(__dirname, 'assets/images/icon.png');
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
        pathname: path.join(__dirname, 'mainWindow.html'),
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
    const mainMenu = Menu.buildFromTemplate([
        {
            label: 'File',
            submenu: [
                {
                    label: 'Close',
                    accelerator: 'Ctrl+C',
                    click(){
                        mainWindow.hide();
                    }
                },
                {
                    label: 'Quit',
                    accelerator: 'Ctrl+Q',
                    click(){
                        app.quit();
                    }
                }
            ]
        }
    ]);
    
    Menu.setApplicationMenu(mainMenu);
    
    // Tray menu
    trayIcon = new Tray(iconPath);
    const trayMenu = Menu.buildFromTemplate([
        {
            label: 'Cubed Server Agent',
            icon: iconPath,
            click: function() {
                mainWindow.show();
            }
        },
        {
            label: 'Quit',
            accelerator: 'Ctrl+Q',
            click(){
                app.quit();
            }
        }
    ]);

    trayIcon.setToolTip('Cubed Server Agent');
    trayIcon.setContextMenu(trayMenu);
    
    trayIcon.on('click', () => {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
    })
    
    
    // Do the job
    function intervalFunc() {
        
        async function firstNetworkPass() {
            const ifaces = await sysinfo.networkInterfaces();
            
            for (let iface of ifaces) {
                const contents = await sysinfo.networkStats(iface.iface);
            }
        }
        
        async function collectAndReport() {
            var post_data = "";
            
            const allData = await sysinfo.getAllData();
            const processes = await sysinfo.processes();
            const networkInterfaceDefault = await sysinfo.networkInterfaceDefault();
            const ifaces = await sysinfo.networkInterfaces();
            
            var networkStats = [];
            
            for (let iface of ifaces) {
                const contents = await sysinfo.networkStats(iface.iface);
                networkStats.push(contents);
            }
            
            // AgentVersion
            agent_version = "1.0";
            post_data = post_data + "{agent_version}" + agent_version + "{/agent_version}";
            
            // Serverkey
            serverkey_file = fs.readFileSync(path.join(__dirname, 'data/serverkey.txt'));
            serverkey = serverkey_file.toString();
            post_data = post_data + "{serverkey}" + serverkey + "{/serverkey}";
            
            // Gateway
            gateway_file = fs.readFileSync(path.join(__dirname, 'data/gateway.txt'));
            gateway = gateway_file.toString();
            post_data = post_data + "{gateway}" + gateway + "{/gateway}";
            
            // Time
            time = new Date();
            post_data = post_data + "{time}" + time + "{/time}";
            
            // Uptime
            uptime = sysinfo.time().uptime;
            post_data = post_data + "{uptime}" + uptime + "{/uptime}";
            
            // Hostname
            hostname = allData.os.hostname;
            post_data = post_data + "{hostname}" + hostname + "{/hostname}";
            
            // Kernel
            kernel = allData.os.kernel;
            post_data = post_data + "{kernel}" + kernel + "{/kernel}";
            
            // Os
            os_name = allData.os.distro;
            post_data = post_data + "{os}" + os_name + "{/os}";
            
            // Os Arch
            os_arch = allData.os.arch;
            post_data = post_data + "{os_arch}" + os_arch + "{/os_arch}";
            
            // CPU Model
            cpu_model = allData.cpu.manufacturer + " " + allData.cpu.brand + " " + allData.cpu.speed + "GHz";
            post_data = post_data + "{cpu_model}" + cpu_model + "{/cpu_model}";
            
            // CPU Cores
            cpu_cores = allData.cpu.cores;
            post_data = post_data + "{cpu_cores}" + cpu_cores + "{/cpu_cores}";
            
            // CPU Speed
            cpu_speed = allData.cpu.speed;
            post_data = post_data + "{cpu_speed}" + cpu_speed + "{/cpu_speed}";
            
            // RAM Total
            ram_total = allData.mem.total;
            post_data = post_data + "{ram_total}" + ram_total + "{/ram_total}";
            
            // RAM Free
            ram_free = allData.mem.free;
            post_data = post_data + "{ram_free}" + ram_free + "{/ram_free}";
            
            // RAM Caches NOT IN WIN
            ram_caches = allData.mem.buffcache;
            post_data = post_data + "{ram_caches}" + ram_caches + "{/ram_caches}";
            
            // RAM Buffers NOT IN WIN
            ram_buffers = allData.mem.buffcache;
            post_data = post_data + "{ram_buffers}" + ram_buffers + "{/ram_buffers}";
            
            // RAM Usage
            ram_usage = allData.mem.used;
            post_data = post_data + "{ram_usage}" + ram_usage + "{/ram_usage}";
            
            // Swap Total
            swap_total = allData.mem.swaptotal;
            post_data = post_data + "{swap_total}" + swap_total + "{/swap_total}";
            
            // Swap Free
            swap_free = allData.mem.swapfree;
            post_data = post_data + "{swap_free}" + swap_free + "{/swap_free}";
            
            // Swap Usage
            swap_usage = allData.mem.swapused;
            post_data = post_data + "{swap_usage}" + swap_usage + "{/swap_usage}";
            
            // CPU Load
            cpu_load = JSON.stringify(allData.currentLoad);
            post_data = post_data + "{cpu_load}" + cpu_load + "{/cpu_load}";
            
            // Net Interfaces
            net_interfaces = JSON.stringify(allData.net);
            post_data = post_data + "{net_interfaces}" + net_interfaces + "{/net_interfaces}";
            
            // Net Stats
            net_stats = JSON.stringify(networkStats);
            post_data = post_data + "{net_stats}" + net_stats + "{/net_stats}";
            
            // Default Interface
            default_interface = networkInterfaceDefault;
            post_data = post_data + "{default_interface}" + default_interface + "{/default_interface}";
            
            // Processes
            processes_post = JSON.stringify(processes);
            post_data = post_data + "{processes}" + processes_post + "{/processes}";
            
            // Ping Latency
            ping_latency = allData.inetLatency;
            post_data = post_data + "{ping_latency}" + ping_latency + "{/ping_latency}";
            
            // Disks
            disk_layout = JSON.stringify(allData.diskLayout);
            post_data = post_data + "{disk_layout}" + disk_layout + "{/disk_layout}";
            
            // Filesystems
            filesystems = JSON.stringify(allData.fsSize);
            post_data = post_data + "{filesystems}" + filesystems + "{/filesystems}";
            
            // Network Connections
            network_connections = JSON.stringify(allData.networkConnections);
            post_data = post_data + "{network_connections}" + network_connections + "{/network_connections}";
            
            // System
            system = JSON.stringify(allData.system);
            post_data = post_data + "{system}" + system + "{/system}";
            
            // Bios
            bios = JSON.stringify(allData.bios);
            post_data = post_data + "{bios}" + bios + "{/bios}";
            
            // Baseboard
            baseboard = JSON.stringify(allData.baseboard);
            post_data = post_data + "{baseboard}" + baseboard + "{/baseboard}";
            
            
            if(gateway != "") {
                request.post(gateway).form({data: post_data})
            }
        }
        
        // get networking data
        firstNetworkPass();
        
        // wait 1 second and run the main reporting function
        setTimeout(collectAndReport, 1000);
    }
    
    // run every 60 seconds
    setInterval(intervalFunc, 60000);
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
