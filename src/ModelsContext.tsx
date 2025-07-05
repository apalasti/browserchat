import { createContext, useContext, useEffect, useMemo, useState } from "react";


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
const LAST_USED_MODEL_KEY = 'last_used_model_name';

export const ModelsContext = createContext<ModelsContextType | undefined>(undefined);

export function useModels() {
	const context = useContext(ModelsContext);
	if (context === undefined) {
		throw new Error('useModels must be used within a ModelsContextProvider');
	}
	return context.models;
};

export function ModelSelector({ value, onChange }: { value?: string; onChange: (value: string) => void }) {
    const models = useModels();

    useEffect(() => {
        if (value === "") {
            const defaultModel = localStorage.getItem(LAST_USED_MODEL_KEY) || (models[0]?.name || "");
            handleModelChange(defaultModel);
        }
    }, []);

    const handleModelChange = (modelName: string) => {
        onChange(modelName);
        localStorage.setItem(LAST_USED_MODEL_KEY, modelName);
    };

    return (
        <select
            name="model-select"
            disabled={!models.length}
            value={value}
            onChange={(e) => handleModelChange(e.target.value)}
            className="text-xs text-gray-700 dark:text-gray-300 focus:outline-none"
        >
            {!models.length ? (
                <option value="">No models available</option>
            ) : (
                models.map(({ name }) => (
                    <option key={name} value={name}>
                        {name}
                    </option>
                ))
            )}
        </select>
    );
}

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
