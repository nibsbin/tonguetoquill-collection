import { useState } from 'react';
import { Menu, FileText, Plus, Settings, Trash2, User } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import logo from 'figma:asset/3706fa20da8044023447a4700332f2d0ecb2a488.png';

export interface FileItem {
	id: string;
	name: string;
}

interface SidebarProps {
	files: FileItem[];
	activeFileId: string;
	onNewFile: () => void;
	onFileSelect: (fileId: string) => void;
	onDeleteFile: (fileId: string) => void;
}

export function Sidebar({
	files,
	activeFileId,
	onNewFile,
	onFileSelect,
	onDeleteFile
}: SidebarProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [autoSave, setAutoSave] = useState(false);
	const [darkTheme, setDarkTheme] = useState(true);
	const [lineNumbers, setLineNumbers] = useState(true);
	const [popoverOpen, setPopoverOpen] = useState(false);

	const handleToggle = () => {
		setIsExpanded(!isExpanded);
	};

	return (
		<div
			className={`flex h-screen flex-col overflow-hidden bg-zinc-900 text-zinc-100 transition-all duration-300 ${
				isExpanded ? 'w-56' : 'w-12'
			}`}
		>
			{/* Hamburger Menu and Title */}
			<div className="relative flex h-12 items-center p-1">
				<Button
					variant="ghost"
					size="icon"
					className="flex-shrink-0 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
					onClick={handleToggle}
				>
					<Menu className="h-5 w-5" />
				</Button>

				<span
					className={`pointer-events-none absolute right-0 left-0 text-center whitespace-nowrap text-zinc-100 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}
					style={{
						fontFamily: "'Lato', Arial, sans-serif",
						fontWeight: 700,
						fontSize: '1.2rem'
					}}
				>
					Tonguetoquill
				</span>
			</div>

			{/* Logo centered below */}
			<div className="relative flex h-12 items-center justify-center overflow-hidden">
				<img src={logo} alt="Tonguetoquill Logo" className="h-8 flex-shrink-0" />
			</div>

			<Separator className="bg-zinc-700" />

			{/* Menu Items */}
			<div className="flex-1 overflow-y-auto p-2">
				<div className="space-y-1">
					<Button
						variant="ghost"
						className="w-full justify-start text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
						onClick={onNewFile}
					>
						<Plus className="mr-2 h-4 w-4 flex-shrink-0" />
						{isExpanded && (
							<span className="animate-in fade-in transition-opacity duration-300">New File</span>
						)}
					</Button>

					{files.length > 0 && isExpanded && (
						<>
							<Separator className="my-2 bg-zinc-700" />
							{files.map((file) => (
								<div
									key={file.id}
									className={`group -mr-2 flex items-center gap-1 rounded pr-2 pl-2 ${
										file.id === activeFileId ? 'bg-zinc-700' : 'hover:bg-zinc-800'
									}`}
								>
									<Button
										variant="ghost"
										className={`flex-1 justify-start text-sm hover:bg-transparent ${
											file.id === activeFileId
												? 'text-zinc-100'
												: 'text-zinc-400 hover:text-zinc-100'
										}`}
										onClick={() => onFileSelect(file.id)}
									>
										<FileText className="mr-2 h-4 w-4 flex-shrink-0" />
										<span className="animate-in fade-in truncate transition-opacity duration-300">
											{file.name}
										</span>
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 flex-shrink-0 text-zinc-500 opacity-0 group-hover:opacity-100 hover:bg-transparent hover:text-red-400"
										onClick={(e) => {
											e.stopPropagation();
											onDeleteFile(file.id);
										}}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							))}
						</>
					)}
				</div>
			</div>

			{/* User Profile and Settings Section */}
			<div className="space-y-1 border-t border-zinc-700 p-2">
				{/* User Profile Button */}
				<Button
					variant="ghost"
					className="w-full justify-start text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
				>
					<User className="mr-2 h-5 w-5 flex-shrink-0" />
					{isExpanded && (
						<span className="animate-in fade-in transition-opacity duration-300">Profile</span>
					)}
				</Button>

				{/* Settings Gear Button */}
				<Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
					<PopoverTrigger asChild>
						<Button
							variant="ghost"
							className="w-full justify-start text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
						>
							<Settings className="mr-2 h-5 w-5 flex-shrink-0" />
							{isExpanded && (
								<span className="animate-in fade-in transition-opacity duration-300">Settings</span>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent
						side="right"
						align="end"
						className="w-64 border-zinc-700 bg-zinc-800 p-0 text-zinc-100"
					>
						<div className="p-4">
							<h3 className="mb-4">Settings</h3>

							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<Label htmlFor="auto-save" className="text-zinc-300">
										Auto-save
									</Label>
									<Switch id="auto-save" checked={autoSave} onCheckedChange={setAutoSave} />
								</div>

								<div className="flex items-center justify-between">
									<Label htmlFor="dark-theme" className="text-zinc-300">
										Dark Theme
									</Label>
									<Switch id="dark-theme" checked={darkTheme} onCheckedChange={setDarkTheme} />
								</div>

								<div className="flex items-center justify-between">
									<Label htmlFor="line-numbers" className="text-zinc-300">
										Line Numbers
									</Label>
									<Switch
										id="line-numbers"
										checked={lineNumbers}
										onCheckedChange={setLineNumbers}
									/>
								</div>
							</div>
						</div>
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
}
