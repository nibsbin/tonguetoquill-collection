import { useRef, useEffect } from 'react';

interface MarkdownEditorProps {
	value: string;
	onChange: (value: string) => void;
	onSelectionChange?: (start: number, end: number) => void;
}

export function MarkdownEditor({ value, onChange, onSelectionChange }: MarkdownEditorProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		const handleSelectionChange = () => {
			if (onSelectionChange && textarea.selectionStart !== undefined) {
				onSelectionChange(textarea.selectionStart, textarea.selectionEnd);
			}
		};

		textarea.addEventListener('select', handleSelectionChange);
		textarea.addEventListener('click', handleSelectionChange);
		textarea.addEventListener('keyup', handleSelectionChange);

		return () => {
			textarea.removeEventListener('select', handleSelectionChange);
			textarea.removeEventListener('click', handleSelectionChange);
			textarea.removeEventListener('keyup', handleSelectionChange);
		};
	}, [onSelectionChange]);

	return (
		<textarea
			ref={textareaRef}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			className="h-full w-full resize-none bg-zinc-900 p-4 font-mono text-zinc-100 outline-none"
			placeholder="Start typing your markdown here..."
			spellCheck={false}
		/>
	);
}
