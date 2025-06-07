import { useState, useEffect } from 'react'

interface Selection {
    text: string;
    position: { top: number; left: number } | null;
}

function App() {
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

        document.addEventListener('selectionchange', selectionChangeListener);
        return () => {
            document.removeEventListener('selectionchange', selectionChangeListener);
            scrollableElements.forEach(element => { element.removeEventListener('scroll', selectionChangeListener) })
        };
    }, []);

    const onClick = () => {
        console.log(selection);
    }

    return (
        <>
            {selection.text && selection.position && (
                <button
                    className='absolute z-9999 px-2 py-1 rounded-md bg-white dark:bg-gray-800 text-sm shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer'
                    style={{
                        top: `${selection.position.top}px`,
                        left: `${selection.position.left}px`,
                        transform: 'translateY(4px)',
                    }}
                    onClick={onClick}
                >
                    Add to Chat
                </button>
            )}
        </>
    );
}

export default App
