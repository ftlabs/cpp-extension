'use strict'; // eslint-disable-line strict
/*global window, chrome, document*/

chrome.runtime.sendMessage({method: 'isEnabled'}, function (response) {
	document.forms[0].enabled.checked = response.enabled;
});

chrome.runtime.sendMessage({
	method: 'trackUiInteraction',
	details: {
		action: 'open-extension-pop-up',
	}
});

document.forms[0].enabled.addEventListener('click', function () {

	const enabled = document.forms[0].enabled.checked;

	chrome.runtime.sendMessage({
		method: 'setEnabled',
		enabled: enabled
	});

	chrome.runtime.sendMessage({
		method: 'trackUiInteraction',
		details: {
			action: enabled ? 'enable-globally' : 'disable-globally',
		}
	});
});

document.forms[0].showwidget.addEventListener('click', function (e) {

	chrome.runtime.sendMessage({
		method: 'trackUiInteraction',
		details: {
			action: 'press-show-widget'
		}
	});

	chrome.runtime.sendMessage({
		method: 'showWidget'
	});

	e.preventDefault();
});
