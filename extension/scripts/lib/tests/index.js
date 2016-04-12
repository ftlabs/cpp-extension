'use strict';
/* globals debug */

const tests = [
	require('./blocking-3rd-party')
];

module.exports = function runTests () {
	return Promise.all(
		tests.map(test => test().catch(e => e.message))
	)
	.then(results => JSON.stringify(results));
};