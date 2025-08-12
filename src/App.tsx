import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import logo from './assets/images/logo.svg';

const App = () => {
	const { t } = useTranslation();
	const [count, setCount] = useState(0);

	return (
		<div className="text-center selection:bg-green-900">
			<header className="flex min-h-screen flex-col items-center justify-center bg-[#282c34] text-white">
				<img
					src={logo}
					className="animate-speed h-60 motion-safe:animate-spin"
					alt="logo"
				/>
				<p className="bg-gradient-to-r from-emerald-300 to-sky-300 bg-clip-text text-5xl font-black text-transparent selection:bg-transparent">
					Vite + React + Typescript + Tailwindcss
				</p>
				<p className="mt-3">
					<button
						type="button"
						className="my-6 rounded bg-gray-300 px-2 py-2 text-[#282C34] transition-all hover:bg-gray-200"
						onClick={() => setCount((count) => count + 1)}
					>
						count is: {count}
					</button>
				</p>
				<p>
					Edit <code className="text-[#8d96a7]">App.tsx</code> and save to test HMR updates.
				</p>
				<p className="mt-3 flex gap-3 text-center text-[#8d96a7]">
					<a
						className="text-[#61dafb] transition-all hover:text-blue-400"
						href="https://reactjs.org"
						target="_blank"
						rel="noopener noreferrer"
					>
						{t('general.learnReact')}
					</a>
					{' | '}
					<a
						className="text-[#61dafb] transition-all hover:text-blue-400"
						href="https://vitejs.dev/guide/features.html"
						target="_blank"
						rel="noopener noreferrer"
					>
						{t('general.viteDocs')}
					</a>
				</p>
			</header>
		</div>
	);
};

export default App;
