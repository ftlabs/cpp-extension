'use strict';
/* global chrome */
window.debug = a => {
	chrome.devtools.inspectedWindow.eval(
		`console.log(CPP Extension: ${typeof a === 'string' ? a : JSON.stringify(a)});`
	)
};

window.debug('Running CPP');

// const runTests = require('./lib/tests');
//
// runTests().then(results => {
// 	window.debug(results);
// 	chrome.runtime.sendMessage({
// 		method: 'resultsReady',
// 		results: results
// 	});
// }, e => window.debug(e));
