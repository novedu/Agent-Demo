import { FormEvent, useState } from 'react';
import { PlayIcon, StopIcon } from '@console/components/ui';

interface InputBoxProps {
  disabled?: boolean;
  onSubmit: (value: string) => void;
  onStop?: () => void;
}

export function InputBox({ disabled, onSubmit, onStop }: InputBoxProps) {
  const [value, setValue] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextValue = value.trim();
    if (!nextValue || disabled) return;
    onSubmit(nextValue);
    setValue('');
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-line bg-white">
      <div className="px-3 pt-2 pb-1.5">
        <div className="flex items-center gap-1.5 rounded-lg border border-line bg-panel px-2.5 py-1.5 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/10">
          <textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            disabled={disabled}
            rows={1}
            placeholder="Ask the agent anything..."
            className="min-h-5 max-h-20 flex-1 resize-none bg-transparent text-xs outline-none placeholder:text-muted"
          />
          {disabled ? (
            <button
              type="button"
              onClick={onStop}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-rose-500 text-white hover:bg-rose-600"
            >
              <StopIcon className="h-3 w-3" />
            </button>
          ) : (
            <button
              type="submit"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={!value.trim()}
            >
              <PlayIcon className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between px-3 pb-2">
        <div className="flex items-center gap-1">
          <ToolbarBtn title="Attach file">
            <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="2" width="10" height="12" rx="1" />
              <path d="M3 5h10" />
            </svg>
          </ToolbarBtn>
          <ToolbarBtn title="Upload image">
            <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="12" height="10" rx="1.5" />
              <circle cx="5.5" cy="6.5" r="1" />
              <path d="M14 11l-3-3-2 2-2-2-3 3" />
            </svg>
          </ToolbarBtn>
          <ToolbarBtn title="Voice input">
            <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="6" y="2" width="4" height="8" rx="2" />
              <path d="M4 7.5C4 9.5 6 11 8 11s4-1.5 4-3.5" />
              <path d="M8 11v2" />
              <path d="M5 13h6" />
            </svg>
          </ToolbarBtn>
          <ToolbarBtn title="More options">
            <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor">
              <circle cx="3" cy="8" r="1.2" />
              <circle cx="8" cy="8" r="1.2" />
              <circle cx="13" cy="8" r="1.2" />
            </svg>
          </ToolbarBtn>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-muted">Model</span>
          <button
            type="button"
            className="inline-flex h-5 items-center gap-1 rounded border border-line bg-white px-1.5 text-[10px] font-medium text-ink hover:bg-panel"
          >
            <span>Claude Sonnet 4</span>
            <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 4.5l2 2 2-2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </form>
  );
}

function ToolbarBtn({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <button
      type="button"
      title={title}
      className="flex h-5 w-5 items-center justify-center rounded text-muted transition-colors hover:bg-panel hover:text-ink"
    >
      {children}
    </button>
  );
}
