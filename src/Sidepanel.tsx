import { StrictMode, useCallback, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import OpenAI from 'openai';
import ChatInput from './ChatInput';

import './styles.css'

const API_KEY = "AIzaSyCDfWHl1UvlDn0alrZmtNbxNtsOk4Tjbyk";
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/";
const MODEL = "gemma-3-27b-it";

function Sidepanel() {
	const client = useMemo(() => new OpenAI({
		baseURL: BASE_URL,
		apiKey: API_KEY,
		dangerouslyAllowBrowser: true,
	}), []);

	const [messages, setMessages] = useState([
		{ role: 'user', content: "You are a helpful assistant." },
	]);

	const onSubmit = useCallback(async ({ context, input }: { context: string; input: string }) => {
		const newUserMessages = [...messages, { role: 'user', content: input }];
		setMessages(newUserMessages);

		try {
			// Initialize an empty message for the assistant to stream into
			let responseMessage = '';
			setMessages(msgs => [...msgs, {role: 'assistant', content: responseMessage}]);

			const stream = await client.chat.completions.create({
				model: MODEL, messages: newUserMessages as any, stream: true,
			});

			for await (const chunk of stream) {
				const chunkContent = chunk.choices[0]?.delta?.content || '';
				responseMessage += chunkContent;
				setMessages(prevMessages => {
					const updatedMessages = [...prevMessages];
					updatedMessages[updatedMessages.length - 1] = {
						role: 'assistant',
						content: responseMessage,
					};
					return updatedMessages;
				});
			}
		} catch (error) {
			console.error('Error calling OpenAI API:', error);
			const newMessagesWithError = [
				...newUserMessages,
				{ role: 'assistant', content: 'Error: Could not get a response.' }
			];
			setMessages(newMessagesWithError);
		}
	}, [messages, client]);
	
	return (
		<div className='flex flex-col h-screen p-2 bg-gray-50 dark:bg-gray-900'>
			<div className='h-full overflow-y-auto pb-4'>
				{messages.slice(1).map((msg, index) => (
					<div key={index} className={`mb-2 p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white self-end ml-auto' : 'bg-gray-200 text-gray-800 self-start mr-auto'}`}>
						<p className="font-semibold">{msg.role === 'user' ? 'You' : 'AI'}:</p>
						<p>{msg.content}</p>
					</div>
				))}
			</div>
			<div className="shadow-lg backdrop-blur-sm p-2">
				<ChatInput onSubmit={onSubmit} />
			</div>
		</div>
	);
}

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Sidepanel />
	</StrictMode>,
)
