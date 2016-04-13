'use strict';
/* global chrome */

const runTests = require('./lib/tests');
const debug = a => {
	chrome.devtools.inspectedWindow.eval(
		`console.log('CPP Extension: ${typeof a === 'string' ? a : JSON.stringify(a)}');`
	)
};
window.debug = debug;

chrome.devtools.inspectedWindow.eval(
	`console.log('CPP Extension: boop', ${1});`
, {
	useContentScriptContext: true
});

debug('Press reload in the widget to begin.');

window.backgroundPageConnection = chrome.runtime.connect({
    name: 'devtools-page'
});

window.backgroundPageConnection.onMessage.addListener(function (message) {
	if (
		message.method === 'reload' &&
		message.data.tab === chrome.devtools.inspectedWindow.tabId
	) {
		chrome.devtools.inspectedWindow.reload();
		runTests()
		.then(results => {
			window.debug(results);
			chrome.runtime.sendMessage({
				method: 'resultsReady',
				results: results
			});
		}, e => window.debug(e));
	}
});