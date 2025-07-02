import { useEffect, useState } from "react";


interface ChatInputProps {
    onSubmit: (params: { context: string; input: string }) => Promise<void>
}


function ChatInput({ onSubmit }: ChatInputProps) {
    const [chatState, setChatState] = useState({ context: "", input: "", isLoading: false });

    useEffect(() => {
        const handleMessage = (message: any) => {
            if (message.action === 'addToChat') {
                setChatState({ ...chatState, context: message.data });
            }
        };

        chrome.runtime.onMessage.addListener(handleMessage);
        return () => {
            chrome.runtime.onMessage.removeListener(handleMessage);
        };
    }, []);

    const submit = async (state: any) => {
        setChatState((_) => ({ context: "", input: "", isLoading: true }));
        try {
            await onSubmit(state);
        } finally {
            setChatState((s) => ({ ...s, isLoading: false }));
        }
    };

    return <form
        className='p-2 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
        onSubmit={async (e) => {
            e.preventDefault();
            submit(chatState);
        }}
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
                    X
                </button>
            </div>
        )}
        <div className='flex items-center'>
            <textarea
                className='flex-1 focus:outline-none text-base resize-none mr-2 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400'
                name='chat-message'
                placeholder='Type your message...'
                value={chatState.input}
                onChange={(e) => setChatState({ ...chatState, input: e.target.value })}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        submit(chatState);
                    }
                }}
                disabled={chatState.isLoading}
            />
            <button
                type="submit"
                className='p-2 bg-black dark:bg-gray-700 hover:cursor-pointer text-white rounded-full hover:bg-gray-900 dark:hover:bg-gray-600 disabled:opacity-50 w-8 h-8 flex items-center justify-center text-lg'
                aria-label="Send message"
                disabled={chatState.isLoading || chatState.input.trim() === ""}
            >
                ↑
            </button>
        </div>
    </form>
}

export default ChatInput;
