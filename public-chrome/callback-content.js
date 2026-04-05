console.log('[callback-content] injected', location.pathname);

// This weird piece of code is used in conjuction with "content_scripts"/"matches": "http://localhost:8180/*"
// in manifest.json to convince Chrome to match any query parameters, but avoid interacting with any other page
// besides extension-callback.html. Specifying "content_scripts"/"matches": "http://localhost:8180/extension-callback.html"
// does not work when query parameters are present (and there will be).
// if (!location.pathname.endsWith('/extension-callback.html')) {
// 	console.log('Sent AUTH_CALLBACK message');
// }

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
