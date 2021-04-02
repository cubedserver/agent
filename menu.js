'use strict';
const {app, Tray, Menu} = require('electron');
const path = require('path');

function mainMenu(mainWindow)
{
    const template = [
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
    ];
    
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function trayMenu(mainWindow) {
    const iconPath = path.join(__dirname, 'static/tray-icon.png');
    
    // Tray menu
    let trayIcon = new Tray(iconPath);
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
}

module.exports = {mainMenu, trayMenu};