'use strict';
const Store = require('electron-store');

module.exports = new Store({
	defaults: {
		serverkey: '32896465-744d-4641-a417-97f37d90fe3a',
        gateway: 'http://192.168.0.7:8080/api/monitoring/server',
		last_sync: null
	}
});
