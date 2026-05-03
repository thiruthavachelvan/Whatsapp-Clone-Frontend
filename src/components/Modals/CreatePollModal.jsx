import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';

const CreatePollModal = ({ onClose, onCreate }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const handleAddOption = () => {
    if (options.length < 12) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validOptions = options.filter(opt => opt.trim() !== '');
    if (question.trim() && validOptions.length >= 2) {
      onCreate({
        question: question.trim(),
        options: validOptions.map(opt => ({ text: opt, votes: [] }))
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#3b4a54] w-full max-w-md rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center space-x-4">
            <button onClick={onClose} className="text-gray-500 dark:text-[#aebac1] hover:bg-gray-100 dark:hover:bg-white/5 p-1 rounded-full transition-colors">
              <X size={24} />
            </button>
            <h2 className="text-lg font-medium text-gray-800 dark:text-[#e9edef]">Create Poll</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Question */}
          <div>
            <label className="block text-sm font-medium text-whatsapp-teal mb-2">Question</label>
            <input
              type="text"
              autoFocus
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question"
              className="w-full bg-transparent border-b border-whatsapp-teal py-2 text-gray-800 dark:text-[#e9edef] focus:outline-none placeholder:text-gray-400 dark:placeholder:text-[#8696a0]"
            />
          </div>

          {/* Options */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-whatsapp-teal mb-2">Options</label>
            <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center space-x-3 group">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 bg-transparent border-b border-gray-200 dark:border-white/10 py-1 text-gray-800 dark:text-[#e9edef] focus:outline-none focus:border-whatsapp-teal transition-colors placeholder:text-gray-400 dark:placeholder:text-[#8696a0]"
                  />
                  {options.length > 2 && (
                    <button 
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Minus size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {options.length < 12 && (
              <button 
                type="button"
                onClick={handleAddOption}
                className="flex items-center space-x-2 text-whatsapp-teal text-sm hover:opacity-80 transition-opacity mt-2"
              >
                <Plus size={18} />
                <span>Add option</span>
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={!question.trim() || options.filter(o => o.trim()).length < 2}
              className="bg-whatsapp-green text-white px-8 py-2 rounded-full font-medium shadow-md hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePollModal;
