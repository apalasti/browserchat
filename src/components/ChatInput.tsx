import { useEffect, useState } from "react";
import { ModelSelector } from "../ModelsContext";


interface ChatInputProps {
    onSubmit: (params: { context: string; input: string; model: string }) => Promise<void>
}


function ChatInput({ onSubmit }: ChatInputProps) {
    const [chatState, setChatState] = useState({
        context: "",
        input: "",
        model: "",
        isLoading: false
    });

    useEffect(() => {
        const handleMessage = (message: any) => {
            if (message.action === 'addToChat') {
                setChatState((s) => ({ ...s, context: message.data }));
            }
        };

        chrome.runtime.onMessage.addListener(handleMessage);
        return () => {
            chrome.runtime.onMessage.removeListener(handleMessage);
        };
    }, []);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setChatState((s) => ({...s, context: "", input: "", isLoading: true }));
        try {
            await onSubmit(chatState as any);
        } finally {
            setChatState((s) => ({ ...s, isLoading: false }));
        }
    };

    return <form
        className='p-2 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
        onSubmit={submit}
    >
        {chatState.context && (
            <div className='flex mb-2 px-2 pt-2 pb-1 bg-gray-100 dark:bg-gray-700 rounded-t-xl rounded-b-sm text-xs text-gray-700 dark:text-gray-300'>
                <p className='line-clamp-3 flex-1'>
                    {chatState.context}
                </p>
                <button
                    type='button'
                    className='ml-2 text-gray-500 dark:text-gray-400 cursor-pointer'
                    onClick={() => setChatState({ ...chatState, context: "" })}
                    aria-label='Remove context'
                >
                    ✕
                </button>
            </div>
        )}
        <div className='flex items-center'>
            <div className="flex-1 flex flex-col">
                <textarea
                    className='focus:outline-none text-base resize-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 mb-2 max-h-48 overflow-y-auto'
                    name='chat-message'
                    placeholder='Type your message...'
                    value={chatState.input}
                    onChange={(e) => {
                        setChatState({ ...chatState, input: e.target.value });
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            submit(e);
                        }
                    }}
                    disabled={chatState.isLoading}
                    rows={1}
                    style={{ minHeight: '2.5rem', maxHeight: '12rem' }}
                />
                <div>
                    <ModelSelector value={chatState.model} onChange={(value) => setChatState({...chatState, model: value})} />
                </div>
            </div>
            <button
                type="submit"
                className='p-2 bg-black dark:bg-gray-700 hover:cursor-pointer text-white rounded-full hover:bg-gray-900 dark:hover:bg-gray-600 disabled:opacity-50 w-8 h-8 flex items-center justify-center text-lg'
                aria-label="Send message"
                disabled={chatState.isLoading || chatState.input.trim() === "" || !chatState.model.trim()}
            >
                ↑
            </button>
        </div>
    </form>
}

export default ChatInput;
