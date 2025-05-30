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
        console.log(selection)
    }

    return (
        <>
            {selection.text && selection.position && (
                <button
                    style={{
                        position: 'absolute',
                        top: `${selection.position.top}px`,
                        left: `${selection.position.left}px`,
                        zIndex: 9999,
                    }}
                    onClick={onClick}
                >
                    ""
                </button>
            )}
        </>
    );
}

export default App
