import { Bold, Italic, Strikethrough, Code, List, ListOrdered, Quote, Link } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

interface EditorToolbarProps {
	onFormat: (type: string) => void;
	mode?: 'markdown' | 'wizard';
	onModeChange?: (mode: 'markdown' | 'wizard') => void;
}

export function EditorToolbar({ onFormat, mode = 'markdown', onModeChange }: EditorToolbarProps) {
	return (
		<div className="flex h-12 items-center justify-between gap-1 border-b border-zinc-700 bg-zinc-800 px-2">
			<Button
				variant="ghost"
				size="sm"
				className="h-7 w-7 p-0 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
				onClick={() => onFormat('bold')}
				title="Bold"
			>
				<Bold className="h-4 w-4" />
			</Button>

			<Button
				variant="ghost"
				size="sm"
				className="h-7 w-7 p-0 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
				onClick={() => onFormat('italic')}
				title="Italic"
			>
				<Italic className="h-4 w-4" />
			</Button>

			<Button
				variant="ghost"
				size="sm"
				className="h-7 w-7 p-0 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
				onClick={() => onFormat('strikethrough')}
				title="Strikethrough"
			>
				<Strikethrough className="h-4 w-4" />
			</Button>

			<Separator orientation="vertical" className="mx-1 h-5 bg-zinc-700" />

			<Button
				variant="ghost"
				size="sm"
				className="h-7 w-7 p-0 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
				onClick={() => onFormat('code')}
				title="Code"
			>
				<Code className="h-4 w-4" />
			</Button>

			<Button
				variant="ghost"
				size="sm"
				className="h-7 w-7 p-0 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
				onClick={() => onFormat('quote')}
				title="Quote"
			>
				<Quote className="h-4 w-4" />
			</Button>

			<Separator orientation="vertical" className="mx-1 h-5 bg-zinc-700" />

			<Button
				variant="ghost"
				size="sm"
				className="h-7 w-7 p-0 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
				onClick={() => onFormat('bulletList')}
				title="Bullet List"
			>
				<List className="h-4 w-4" />
			</Button>

			<Button
				variant="ghost"
				size="sm"
				className="h-7 w-7 p-0 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
				onClick={() => onFormat('numberedList')}
				title="Numbered List"
			>
				<ListOrdered className="h-4 w-4" />
			</Button>

			<Separator orientation="vertical" className="mx-1 h-5 bg-zinc-700" />

			<Button
				variant="ghost"
				size="sm"
				className="h-7 w-7 p-0 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
				onClick={() => onFormat('link')}
				title="Link"
			>
				<Link className="h-4 w-4" />
			</Button>

			<div className="flex-1" />

			<Tabs
				value={mode}
				onValueChange={(value) => {
					if (value && onModeChange) {
						onModeChange(value as 'markdown' | 'wizard');
					}
				}}
			>
				<TabsList className="h-7 bg-zinc-900 p-0.5">
					<TabsTrigger
						value="markdown"
						className="h-6 px-3 text-xs data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 data-[state=inactive]:text-zinc-400"
					>
						Markdown
					</TabsTrigger>
					<TabsTrigger
						value="wizard"
						className="h-6 px-3 text-xs data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100 data-[state=inactive]:text-zinc-400"
					>
						Wizard
					</TabsTrigger>
				</TabsList>
			</Tabs>
		</div>
	);
}
