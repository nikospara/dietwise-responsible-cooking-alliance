console.log('[callback-content] injected', location.pathname);

const isCallbackPage = location.pathname.endsWith('/extension-callback.html');

if (!isCallbackPage) {
	console.log('[callback-content] ignored non-callback page');
} else {
	window.addEventListener('message', (event) => {
		if (event.source !== window) return;
		if (event.data?.type !== 'KEYCLOAK_CALLBACK') return;

		chrome.runtime.sendMessage({
			type: 'AUTH_CALLBACK',
			code: event.data.code,
			state: event.data.state,
		});

		console.log('Sent AUTH_CALLBACK message');
	});
}
