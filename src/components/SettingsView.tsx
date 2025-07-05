import { type FormEvent } from 'react';
import { useContext } from 'react'; // Import useContext directly
import { ModelsContext } from '../ModelsContext'; // Import ModelsContext from SidePanel

interface SettingsViewProps {
    onExitClick: () => void;
}

const SettingsView = ({ onExitClick }: SettingsViewProps) => {
    const { models, addModel, removeModel } = useContext(ModelsContext)!;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        
        const modelName = formData.get('modelName') as string;
        const baseURL = formData.get('baseURL') as string;
        const apiKey = formData.get('apiKey') as string;

        addModel({
            name: modelName,
            baseURL: baseURL,
            apiKey: apiKey
        });

        form.reset();
    };

    return (
        <>
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 p-2">
                <button onClick={onExitClick} className="ml-auto px-2 py-1 text-sm font-medium text-gray-700 dark:text-gray-200 bg-transparent border-transparent rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    ✕
                </button>
            </div>
            <div className="grid grid-cols-[auto_2fr_auto] gap-y-0 gap-x-4 m-2 text-sm border-b border-gray-200 dark:border-gray-700">
                <div className="contents group">
                    <div className="text-gray-900 dark:text-gray-100">
                        Model Name
                    </div>
                    <div className="text-gray-900 dark:text-gray-100">
                        Base URL
                    </div>
                    <div></div>
                </div>
                {models.map((model) => (
                    <div key={model.name} className="contents group">
                        <div className="py-2 truncate text-gray-900 dark:text-gray-100">
                            {model.name}
                        </div>
                        <div className="py-2 truncate text-gray-600 dark:text-gray-400">
                            {model.baseURL}
                        </div>
                        <button
                            onClick={() => removeModel(model.name)}
                            className="text-gray-700 dark:text-gray-200 hover:text-red-500 cursor-pointer"
                            aria-label="Remove model"
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2 items-center p-2 pt-0">
                <input
                    type="text"
                    name="modelName"
                    required
                    className="w-2/5 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-sm text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Model Name"
                />
                <input
                    type="url"
                    name="baseURL"
                    className="w-2/5 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-sm text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Base URL"
                />
                <input
                    type="text"
                    name="apiKey"
                    className="w-1/5 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-sm text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="API Key"
                />
                <button
                    type="submit"
                    className="ml-auto px-1 py-1 text-lg font-medium text-gray-700 dark:text-gray-200 bg-transparent border-transparent rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                    +
                </button>
            </form>
        </>
    );
};

export default SettingsView;
