import { useState } from 'react';

interface Option {
  label: string;
  value: string;
  description?: string;
}

interface OptionCardsProps {
  options: Option[];
  multiple?: boolean;
  onSelect: (value: string | string[]) => void;
}

export function OptionCards({ options, multiple, onSelect }: OptionCardsProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const handleClick = (value: string) => {
    if (multiple) {
      setSelected((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
      );
    } else {
      onSelect(value);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => handleClick(option.value)}
          className={`px-4 py-2 rounded-lg border text-sm transition-colors cursor-pointer ${
            selected.includes(option.value)
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
          }`}
        >
          <div className="font-medium">{option.label}</div>
          {option.description && (
            <div className="text-xs opacity-75 mt-0.5">{option.description}</div>
          )}
        </button>
      ))}
      {multiple && selected.length > 0 && (
        <button
          onClick={() => onSelect(selected)}
          className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm cursor-pointer hover:bg-blue-600 transition-colors"
        >
          确认选择
        </button>
      )}
    </div>
  );
}
