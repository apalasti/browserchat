import { createContext, useEffect, useMemo, useState } from "react";


interface Model {
	baseURL: string;
	apiKey: string;
	name: string;
}

interface ModelsContextType {
	models: Model[];
	addModel: (model: Model) => void;
	removeModel: (name: string) => void;
}

const LOCAL_STORAGE_KEY = 'ai_models';
export const ModelsContext = createContext<ModelsContextType | undefined>(undefined);

export function ModelsContextProvider({ children }: { children: React.ReactNode }) {
    const [models, setModels] = useState<Model[]>(() => {
        // Initialize state from local storage
        try {
            const storedModels = localStorage.getItem(LOCAL_STORAGE_KEY);
            return storedModels ? JSON.parse(storedModels) : [];
        } catch (error) {
            console.error("Failed to parse models from localStorage", error);
            return [];
        }
    });

    useEffect(() => {
        // Save models to local storage whenever they change
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(models));
        } catch (error) {
            console.error("Failed to save models to localStorage", error);
        }
    }, [models]);

    const modelContextValue = useMemo(() => ({
        models,
        addModel(newModel: Model) {
            setModels((prevModels) => [...prevModels, newModel]);
        },
        removeModel(name: string) {
            setModels((prevModels) => prevModels.filter((model) => model.name !== name));
        }
    }), [models])

    return (
        <ModelsContext.Provider value={modelContextValue}>
            {children}
        </ModelsContext.Provider>
    )
}
