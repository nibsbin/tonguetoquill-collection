import {
	Share2,
	Download,
	MoreVertical,
	FileText,
	Info,
	Shield,
	Upload,
	ExternalLink,
	Keyboard
} from 'lucide-react';

import { Button } from './ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from './ui/dropdown-menu';

interface TopMenuProps {
	fileName: string;
	onShare: () => void;
	onDownload: () => void;
}

export function TopMenu({ fileName, onShare, onDownload }: TopMenuProps) {
	return (
		<div className="flex h-12 items-center justify-between border-b border-zinc-700 bg-zinc-800 px-4">
			<div className="flex items-center gap-2">
				<span className="text-zinc-300">{fileName}</span>
			</div>

			<div className="flex items-center gap-2">
				<div className="rounded-md border border-zinc-600 p-0.5">
					<Button
						variant="ghost"
						size="sm"
						className="h-7 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
						onClick={onDownload}
					>
						<Download className="mr-1 h-4 w-4" />
						Download
					</Button>
				</div>

				{/* Meatball Menu */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="h-8 w-8 p-0 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
						>
							<MoreVertical className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="w-56 border-zinc-700 bg-zinc-800 text-zinc-100"
					>
						<DropdownMenuItem
							className="text-zinc-300 focus:bg-zinc-700 focus:text-zinc-100"
							onClick={onShare}
						>
							<Share2 className="mr-2 h-4 w-4" />
							Share
						</DropdownMenuItem>

						<DropdownMenuItem className="text-zinc-300 focus:bg-zinc-700 focus:text-zinc-100">
							<Upload className="mr-2 h-4 w-4" />
							Import File
						</DropdownMenuItem>

						<DropdownMenuSeparator className="bg-zinc-700" />

						<DropdownMenuItem className="text-zinc-300 focus:bg-zinc-700 focus:text-zinc-100">
							<FileText className="mr-2 h-4 w-4" />
							Document Info
						</DropdownMenuItem>

						<DropdownMenuItem className="text-zinc-300 focus:bg-zinc-700 focus:text-zinc-100">
							<Keyboard className="mr-2 h-4 w-4" />
							Keyboard Shortcuts
						</DropdownMenuItem>

						<DropdownMenuSeparator className="bg-zinc-700" />

						<DropdownMenuItem
							className="text-zinc-300 focus:bg-zinc-700 focus:text-zinc-100"
							onClick={() => window.open('/about', '_blank')}
						>
							<Info className="mr-2 h-4 w-4" />
							About Us
							<ExternalLink className="ml-auto h-3 w-3" />
						</DropdownMenuItem>

						<DropdownMenuItem
							className="text-zinc-300 focus:bg-zinc-700 focus:text-zinc-100"
							onClick={() => window.open('/terms', '_blank')}
						>
							<FileText className="mr-2 h-4 w-4" />
							Terms of Use
							<ExternalLink className="ml-auto h-3 w-3" />
						</DropdownMenuItem>

						<DropdownMenuItem
							className="text-zinc-300 focus:bg-zinc-700 focus:text-zinc-100"
							onClick={() => window.open('/privacy', '_blank')}
						>
							<Shield className="mr-2 h-4 w-4" />
							Privacy Policy
							<ExternalLink className="ml-auto h-3 w-3" />
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
