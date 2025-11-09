/**
 * First Visit Actions for Guest Users
 * Simple system for running actions on guest's first visit
 * Mirrors the server-side first-login-actions pattern for consistency
 */

import { templateService } from '$lib/services/templates';
import { DocumentBrowserStorage } from '$lib/services/documents/document-browser-storage';

/**
 * First Visit Action
 * Simple interface for actions that run on first visit
 */
interface FirstVisitAction {
	id: string;
	description: string;
	execute: () => Promise<void>;
}

/**
 * Available first visit actions
 * Add new actions here - they'll automatically run for new guests
 */
const FIRST_VISIT_ACTIONS: FirstVisitAction[] = [
	{
		id: 'create_welcome_document',
		description: 'Create a USAF Memo document for new guests',
		async execute() {
			// Ensure template service is initialized
			await templateService.initialize();

			const storage = new DocumentBrowserStorage();
			const template = await templateService.getTemplate('usaf_template.md');

			await storage.createDocument({
				owner_id: 'guest',
				name: 'My First Memo',
				content: template.content
			});
		}
	}
	// Add more actions here as needed
];

const INIT_KEY = 'tonguetoquill_guest_initialized';

/**
 * Run first visit actions for a guest user
 * Checks if first visit has been completed, if not runs all actions
 */
export async function runGuestFirstVisitActions(): Promise<void> {
	console.log('Checking guest first visit actions');

	try {
		// Check if first visit has already been completed
		if (localStorage.getItem(INIT_KEY) === 'true') {
			console.log('Guest first visit already completed');
			return;
		}

		console.log(`Running ${FIRST_VISIT_ACTIONS.length} first visit actions for guest`);

		// Run all actions
		for (const action of FIRST_VISIT_ACTIONS) {
			try {
				console.log(`Executing action: ${action.id}`);
				await action.execute();
				console.log(`Successfully executed action: ${action.id}`);
			} catch (error) {
				console.error(`Failed to execute action ${action.id} for guest:`, error);
				// Continue with other actions even if one fails
			}
		}

		// Mark first visit as completed
		localStorage.setItem(INIT_KEY, 'true');
		console.log('Marked guest first visit as completed');
	} catch (error) {
		console.error('Error running guest first visit actions:', error);
	}
}

/**
 * Reset guest initialization state (useful for testing)
 */
export function resetGuestInitialization(): void {
	localStorage.removeItem(INIT_KEY);
}
