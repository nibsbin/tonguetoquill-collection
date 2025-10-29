import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownPreviewProps {
	content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
	return (
		<div className="prose prose-slate h-full w-full max-w-none overflow-auto bg-white p-6">
			<ReactMarkdown remarkPlugins={[remarkGfm]}>
				{content || '*Preview will appear here...*'}
			</ReactMarkdown>
		</div>
	);
}
