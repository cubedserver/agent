'use strict';
const Store = require('electron-store');

module.exports = new Store({
	defaults: {
		agentVersion: '1.0.2',
		serverkey: null,
		gateway: 'https://cubedserver.com/api/monitoring/server',
		lastSync: null
	}
});
