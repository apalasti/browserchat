import React from 'react'
import ReactDOM from 'react-dom/client'
import { useState, useEffect } from 'react'


interface Selection {
    text: string;
    position: { top: number; left: number } | null;
}

const styleTag = document.createElement('style');
styleTag.textContent = `
    #browserchat-add-to-chat-button {
        color: black;
        background-color: #ffffff;
    }

    #browserchat-add-to-chat-button:hover {
        background-color: #f9fafb !important; /* hover:bg-gray-50 */
    }

    @media (prefers-color-scheme: dark) {
        #browserchat-add-to-chat-button {
            background-color: #1f2937 !important; /* dark:bg-gray-800 */
            border-color: #374151 !important; /* dark:border-gray-700 */
            color: white;
        }

        #browserchat-add-to-chat-button:hover {
            background-color: #374151 !important; /* dark:hover:bg-gray-700 */
        }
    }
`;
document.head.appendChild(styleTag);

const root = document.createElement('div');
root.id = 'browserchat-root';
document.body.appendChild(root);

const rootElement = ReactDOM.createRoot(root);
rootElement.render(
  <React.StrictMode>
    <ContentScript />
  </React.StrictMode>,
);

function ContentScript() {
    const [selection, setSelection] = useState<Selection>({
        text: "", position: null
    });
    useEffect(() => {
        const selectionChangeListener = (_: Event) => {
            const selection = document.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const rects = range.getClientRects();

                let leftmost = Infinity;
                let downmost = -Infinity;
                for (let i = 0; i < rects.length; i++) {
                    const rect = rects.item(i);
                    if (rect) {
                        leftmost = Math.min(leftmost, rect.left);
                        downmost = Math.max(downmost, rect.bottom);
                    }
                }
                
                const top = (downmost !== -Infinity ? downmost : 0) + window.scrollY;
                const left = (leftmost !== Infinity ? leftmost : 0) + window.scrollX;
                setSelection({
                    text: selection.toString().trim(),
                    position: { top, left }
                });
            } else {
                setSelection({ text: "", position: null });
            }
        };

        const scrollableElements = document.querySelectorAll("*");
        scrollableElements.forEach(element => {
            if (element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth) {
                element.addEventListener('scroll', selectionChangeListener);
            }
        });

        window.addEventListener('resize', selectionChangeListener);
        document.addEventListener('selectionchange', selectionChangeListener);
        return () => {
            document.removeEventListener('selectionchange', selectionChangeListener);
            window.removeEventListener('resize', selectionChangeListener);
            scrollableElements.forEach(element => {
                element.removeEventListener('scroll', selectionChangeListener);
            });
        };
    }, []);

    const onClick = () => {
        // Send a message to the background script
        chrome.runtime.sendMessage({
            action: "addToChat",
            data: selection.text.trim()
        });
    }

    return (
        <>
            {selection.text && selection.position && (
                <button
                    id="browserchat-add-to-chat-button"
                    style={{
                        position: 'absolute',
                        zIndex: 9999,
                        paddingLeft: '0.5rem',
                        paddingRight: '0.5rem',
                        paddingTop: '0.35rem',
                        paddingBottom: '0.35rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                        border: '1px solid #e5e7eb',
                        cursor: 'pointer',
                        userSelect: 'none',
                        lineHeight: 'normal',
                        top: `${selection.position.top}px`,
                        left: `${selection.position.left}px`,
                        transform: 'translateY(4px)',
                        outline: 'none',
                    }}
                    onClick={onClick}
                >
                    Add to Chat
                </button>
            )}
        </>
    );
}
