export async function createPKCE() {
	const verifier = crypto.randomUUID() + crypto.randomUUID();

	const challengeBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));

	const challenge = btoa(String.fromCharCode(...new Uint8Array(challengeBuffer))).replace(/\+|\/|=+$/g, (s) => {
		switch (s) {
			case '+':
				return '-';
			case '/':
				return '_';
			default:
				return '';
		}
	});

	return { verifier, challenge };
}
