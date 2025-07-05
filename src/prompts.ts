
export const SYSTEM_PROMPT = (
    "You are a helpful assistant. Provide concise and accurate answers." +
    "The user may provide additional context in <context> tags - when present," +
    " use this context to inform your response. If no context is provided," +
    " answer based on your general knowledge."
);

export const createUserPrompt = (context: string, input: string): string => {
    context = context.trim();
    if (context) {
        return `<context>\n${context}\n</context>\n\n${input}`;
    }
    return input;
};
