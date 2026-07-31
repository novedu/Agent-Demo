import { FormEvent, useState } from 'react';
import { Button, PlayIcon, StopIcon } from '@console/components/ui';

interface InputBoxProps {
  disabled?: boolean;
  onSubmit: (value: string) => void;
  onStop?: () => void;
}

export function InputBox({ disabled, onSubmit, onStop }: InputBoxProps) {
  const [value, setValue] = useState('分析华东区域销售下降原因，并生成报告');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextValue = value.trim();
    if (!nextValue || disabled) return;
    onSubmit(nextValue);
    setValue('');
  }

  return (
    <form onSubmit={handleSubmit} className="shrink-0 border-t border-line bg-white p-4">
      <div className="flex gap-2">
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={disabled}
          rows={1}
          placeholder="输入任务，例如：分析华东区域销售下降原因，并生成报告"
          className="min-h-10 max-h-24 flex-1 resize-none rounded-lg border border-line px-3 py-2 text-sm outline-none transition-colors duration-200 focus:border-accent focus:ring-2 focus:ring-accent/10 disabled:bg-panel"
        />
        {disabled ? (
          <Button type="button" variant="secondary" className="h-10 w-24 shrink-0" onClick={onStop}>
            <StopIcon className="h-4 w-4" />
            Stop
          </Button>
        ) : (
          <Button type="submit" variant="primary" className="h-10 w-24 shrink-0">
            <PlayIcon className="h-4 w-4" />
            发送任务
          </Button>
        )}
      </div>
    </form>
  );
}
