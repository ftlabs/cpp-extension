'use strict';
/* globals debug */

const tests = [
	require('./blocking-3rd-party')
];

module.exports = function runTests () {
	return Promise.all(
		tests.map(test => test())
		.then(() => true)
		.catch(e => {
			debug(e);
			return false;
		})
	);
};