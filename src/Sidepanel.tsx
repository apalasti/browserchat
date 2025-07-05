import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import ChatView from './components/ChatView';
import SettingsView from './components/SettingsView';

import './styles.css'
import { ModelsContextProvider } from './ModelsContext';


function SidePanel() {
	const [activeView, setActiveView] = useState<"chat" | "settings">("chat");

	
	return (
		<ModelsContextProvider>
			<div className='flex flex-col h-screen bg-gray-50 dark:bg-gray-900'>
				{activeView === "chat" && <ChatView onSettingsClick={() => setActiveView("settings")} />}
				{activeView === "settings" && <SettingsView onExitClick={() => setActiveView("chat")} />}
			</div>
		</ModelsContextProvider>
	);
}

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<SidePanel />
	</StrictMode>,
)
