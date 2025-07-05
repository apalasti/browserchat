import OpenAI from "openai";
import { useCallback, useMemo, useState } from "react";
import { createUserPrompt, SYSTEM_PROMPT } from "../prompts";
import ChatInput from "./ChatInput";
import { useModels } from "../ModelsContext";


interface ChatPanelProps {
    onSettingsClick: () => void
}

function ChatView({ onSettingsClick }: ChatPanelProps) {
	const models = useModels()
	const client = useMemo(() => new OpenAI({
		dangerouslyAllowBrowser: true,
		apiKey: "",
	}), []);

	const [messages, setMessages] = useState([
		{ role: 'user', content: SYSTEM_PROMPT },
	]);

	const onSubmit = useCallback(async({ model, context, input }: { model: string; context: string; input: string }) => {
		const selectedModel = models.find((m) => m.name == model)!;
		const newUserMessages = [...messages, { role: 'user', content: createUserPrompt(context, input) }];
		setMessages(newUserMessages);

		try {
			let responseMessage = '';
			setMessages(msgs => [...msgs, {role: 'assistant', content: responseMessage}]);

			client.apiKey = selectedModel.apiKey;
			client.baseURL = selectedModel.baseURL;
			const stream = await client.chat.completions.create({
				model: selectedModel.name, messages: newUserMessages as any, stream: true,
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
		<>
			<div className="flex justify-between border-b border-gray-200 dark:border-gray-700 p-2">
				<button className="px-2 py-1 text-sm font-medium text-gray-700 dark:text-gray-200 bg-transparent border-transparent rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
					+
				</button>
				<button onClick={onSettingsClick} className="px-2 py-1 text-sm font-medium text-gray-700 dark:text-gray-200 bg-transparent border-transparent rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
					Settings
				</button>
			</div>
			<div className="h-full flex flex-col p-2">
				<div className="flex-1 overflow-y-auto">
					{messages.slice(1).map((msg, index) => (
						<div key={index} className={`mb-2 p-2 rounded-lg max-w-[80%] ${msg.role === 'user' ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-200 text-gray-800 mr-auto'}`}>
							<p className="font-semibold">{msg.role === 'user' ? 'You' : 'AI'}:</p>
							<p>{msg.content}</p>
						</div>
					))}
				</div>
				<ChatInput onSubmit={onSubmit} />
			</div>
		</>
	);
}

export default ChatView;
