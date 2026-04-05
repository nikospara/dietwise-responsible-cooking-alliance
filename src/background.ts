import { authService } from 'auth/authService';

if (typeof browser !== 'undefined') {
	browser.action.onClicked.addListener(() => {
		browser.sidebarAction.open();
	});

	browser.runtime.onMessage.addListener((msg) => {
		if (msg.type === 'AUTH_CALLBACK') {
			authService.handleCallback(msg.code);
		}
	});
} else if (typeof chrome !== 'undefined' && typeof chrome.sidePanel !== 'undefined') {
	chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error));

	chrome.runtime.onMessage.addListener((msg) => {
		if (msg.type === 'AUTH_CALLBACK') {
			authService.handleCallback(msg.code);
		}
	});
}
