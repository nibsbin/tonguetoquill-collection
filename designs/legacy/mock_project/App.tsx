import { useState } from 'react';
import { Sidebar, FileItem } from './components/Sidebar';
import { TopMenu } from './components/TopMenu';
import { EditorToolbar } from './components/EditorToolbar';
import { MarkdownEditor } from './components/MarkdownEditor';
import { MarkdownPreview } from './components/MarkdownPreview';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './components/ui/sonner';

interface File {
	id: string;
	name: string;
	content: string;
}

export default function App() {
	const [files, setFiles] = useState<File[]>([
		{
			id: '1',
			name: 'welcome.md',
			content:
				'# Welcome to Markdown Editor\n\nStart editing to see the preview update in real-time!\n\n## Features\n\n- **Bold text**\n- *Italic text*\n- ~~Strikethrough~~\n- `Code blocks`\n- [Links](https://example.com)\n\n```javascript\nconst hello = "world";\n```\n\n> Blockquotes are supported too!'
		}
	]);
	const [activeFileId, setActiveFileId] = useState('1');
	const [selectionStart, setSelectionStart] = useState(0);
	const [selectionEnd, setSelectionEnd] = useState(0);
	const [editorMode, setEditorMode] = useState<'markdown' | 'wizard'>('markdown');

	const activeFile = files.find((f) => f.id === activeFileId);
	const markdown = activeFile?.content || '';
	const fileName = activeFile?.name || 'untitled.md';

	const updateActiveFileContent = (content: string) => {
		setFiles(files.map((f) => (f.id === activeFileId ? { ...f, content } : f)));
	};

	const handleFormat = (type: string) => {
		const textarea = document.querySelector('textarea');
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selectedText = markdown.substring(start, end);
		let formattedText = '';
		let newCursorPos = start;

		switch (type) {
			case 'bold':
				formattedText = `**${selectedText}**`;
				newCursorPos = start + 2;
				break;
			case 'italic':
				formattedText = `*${selectedText}*`;
				newCursorPos = start + 1;
				break;
			case 'strikethrough':
				formattedText = `~~${selectedText}~~`;
				newCursorPos = start + 2;
				break;
			case 'code':
				formattedText = `\`${selectedText}\``;
				newCursorPos = start + 1;
				break;
			case 'quote':
				formattedText = `> ${selectedText}`;
				newCursorPos = start + 2;
				break;
			case 'bulletList':
				formattedText = `- ${selectedText}`;
				newCursorPos = start + 2;
				break;
			case 'numberedList':
				formattedText = `1. ${selectedText}`;
				newCursorPos = start + 3;
				break;
			case 'link':
				formattedText = `[${selectedText}](url)`;
				newCursorPos = start + 1;
				break;
			default:
				return;
		}

		const newMarkdown = markdown.substring(0, start) + formattedText + markdown.substring(end);
		updateActiveFileContent(newMarkdown);

		setTimeout(() => {
			textarea.focus();
			textarea.setSelectionRange(newCursorPos, newCursorPos + selectedText.length);
		}, 0);
	};

	const handleNewFile = () => {
		const newFileId = Date.now().toString();
		const newFile: File = {
			id: newFileId,
			name: `untitled-${files.length + 1}.md`,
			content: ''
		};
		setFiles([...files, newFile]);
		setActiveFileId(newFileId);
		toast.success('New file created');
	};

	const handleSaveFile = () => {
		const blob = new Blob([markdown], { type: 'text/markdown' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = fileName;
		a.click();
		URL.revokeObjectURL(url);
		toast.success('File saved successfully');
	};

	const handleFileSelect = (fileId: string) => {
		setActiveFileId(fileId);
	};

	const handleDeleteFile = (fileId: string) => {
		if (files.length === 1) {
			toast.error('Cannot delete the last file');
			return;
		}

		const updatedFiles = files.filter((f) => f.id !== fileId);
		setFiles(updatedFiles);

		if (activeFileId === fileId) {
			setActiveFileId(updatedFiles[0].id);
		}

		toast.success('File deleted');
	};

	const handleShare = () => {
		if (navigator.share) {
			navigator
				.share({
					title: fileName,
					text: markdown
				})
				.catch(() => {
					toast.error('Sharing failed');
				});
		} else {
			navigator.clipboard.writeText(markdown);
			toast.success('Copied to clipboard');
		}
	};

	const handleDownload = () => {
		handleSaveFile();
	};

	const fileItems: FileItem[] = files.map((f) => ({ id: f.id, name: f.name }));

	return (
		<div className="flex h-screen bg-zinc-900">
			<Sidebar
				files={fileItems}
				activeFileId={activeFileId}
				onNewFile={handleNewFile}
				onFileSelect={handleFileSelect}
				onDeleteFile={handleDeleteFile}
			/>

			<div className="flex flex-1 flex-col">
				<TopMenu fileName={fileName} onShare={handleShare} onDownload={handleDownload} />

				<div className="flex flex-1">
					{/* Editor Section */}
					<div className="flex flex-1 flex-col border-r border-zinc-700">
						<EditorToolbar onFormat={handleFormat} mode={editorMode} onModeChange={setEditorMode} />
						<MarkdownEditor
							value={markdown}
							onChange={updateActiveFileContent}
							onSelectionChange={(start, end) => {
								setSelectionStart(start);
								setSelectionEnd(end);
							}}
						/>
					</div>

					{/* Preview Section */}
					<div className="flex-1 overflow-auto">
						<MarkdownPreview content={markdown} />
					</div>
				</div>
			</div>

			<Toaster />
		</div>
	);
}
