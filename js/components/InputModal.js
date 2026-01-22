const InputModal = ({ isOpen, onClose, onConfirm, title, message, inputValue: initialValue = '' }) => {
    const [inputValue, setInputValue] = React.useState(initialValue);

    React.useEffect(() => {
        if (isOpen) {
            setInputValue(initialValue || '');
        }
    }, [isOpen, initialValue]);

    const handleConfirm = () => {
        onConfirm(inputValue);
    };
    
    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1200]"
            onClick={onClose}
        >
            <div 
                className="bg-card-dark rounded-lg p-6 shadow-lg border border-primary/20 w-full max-w-sm"
                onClick={e => e.stopPropagation()}
            >
                <h3 className="text-lg font-bold text-white text-center mb-2">{title}</h3>
                <p className="text-white/80 text-center mb-4">{message}</p>
                <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-32 mx-auto block text-center text-xl font-bold bg-gray-800 text-white border border-white/20 rounded-md p-2 focus:ring-2 focus:ring-primary focus:border-primary"
                    autoFocus
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleConfirm();
                        }
                    }}
                />
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600/50 text-white rounded-md hover:bg-gray-600 transition-colors">キャンセル</button>
                    <button onClick={handleConfirm} className="px-4 py-2 bg-primary text-background-dark font-bold rounded-md hover:bg-primary/80 transition-colors">確定</button>
                </div>
            </div>
        </div>
    );
};