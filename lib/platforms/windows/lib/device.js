var Q = require('q');

module.exports = {
    list: function () { return Q([
    		{id:'desktop', value: '0'},
    		{id:'phone', value: '0'}
    	]);
	},
    isSupported: true
};