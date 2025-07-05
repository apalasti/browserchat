import OpenAI from "openai";
import { useCallback, useMemo, useState } from "react";
import { createUserPrompt, SYSTEM_PROMPT } from "../prompts";
import ChatInput from "./ChatInput";
import { useModels } from "../ModelsContext";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";


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
			<div className="h-full flex flex-col overflow-hidden">
				<div className="flex-1 overflow-y-auto p-2 ">
					{messages.slice(1).map((msg, index) => { 
						let dynamicClasses = msg.role === "user" 
							? "rounded-lg max-w-[80%] ml-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
							: "";

						return (
							<div key={index} className={`text-base mb-4 p-2 ${dynamicClasses}`}>
								<Markdown remarkPlugins={[remarkGfm]}>
									{msg.content}
								</Markdown>
							</div>
						);
					})}
				</div>
				<div className="p-2">
					<ChatInput onSubmit={onSubmit} />
				</div>
			</div>
		</>
	);
}

export default ChatView;
