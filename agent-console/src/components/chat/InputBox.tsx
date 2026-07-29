import { FormEvent, useState } from 'react';

interface InputBoxProps {
  disabled?: boolean;
  onSubmit: (value: string) => void;
}

export function InputBox({ disabled, onSubmit }: InputBoxProps) {
  const [value, setValue] = useState('分析华东区域销售下降原因，并生成报告');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextValue = value.trim();
    if (!nextValue || disabled) return;
    onSubmit(nextValue);
    setValue('');
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-line bg-white p-3">
      <div className="flex gap-2">
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={disabled}
          rows={3}
          placeholder="输入任务，例如：分析华东区域销售下降原因，并生成报告"
          className="min-h-20 flex-1 resize-none rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 disabled:bg-panel"
        />
        <button
          type="submit"
          disabled={disabled}
          className="h-20 w-24 rounded-md bg-accent text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          发送任务
        </button>
      </div>
    </form>
  );
}
