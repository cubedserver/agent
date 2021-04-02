'use strict';
const Store = require('electron-store');

module.exports = new Store({
	defaults: {
		serverkey: null,
		gateway: 'https://cubedserver.com/api/monitoring/server',
		lastSync: null
	}
});
