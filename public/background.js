if (typeof browser !== 'undefined') {
	browser.action.onClicked.addListener(() => {
		browser.sidebarAction.open();
	});
} else if (
	typeof chrome !== 'undefined' &&
	typeof chrome.sidePanel !== 'undefined'
) {
	chrome.sidePanel
		.setPanelBehavior({ openPanelOnActionClick: true })
		.catch((error) => console.error(error));
}
