/**
 * First Login Actions
 * Simple system for running actions on user's first login
 */

import type { UUID } from '$lib/services/auth/types';
import { getAuthService } from '../auth/auth-provider';
import { documentService } from '../documents';
import { loadTemplate } from '../templates';

/**
 * First Login Action
 * Simple interface for actions that run on first login
 */
interface FirstLoginAction {
	id: string;
	description: string;
	execute: (userId: UUID) => Promise<void>;
}

/**
 * Available first login actions
 * Add new actions here - they'll automatically run for new users
 */
const FIRST_LOGIN_ACTIONS: FirstLoginAction[] = [
	{
		id: 'create_welcome_document',
		description: 'Create a USAF Memo document for new users',
		async execute(userId: UUID) {
			const templateContent = await loadTemplate('usaf_template.md');
			await documentService.createDocument({
				user_id: userId,
				name: 'My First Memo',
				content: templateContent
			});
		}
	}
	// Add more actions here as needed
];

/**
 * Run first login actions for a user
 * Checks if first login has been completed, if not runs all actions
 */
export async function runFirstLoginActions(userId: UUID, accessToken: string): Promise<void> {
	console.log(`Checking first login actions for user ${userId}`);

	try {
		const authService = await getAuthService();
		const user = await authService.getCurrentUser(accessToken);

		if (!user) {
			console.error(`Cannot run first login actions: User ${userId} not found`);
			return;
		}

		// Check if first login has already been completed
		if (user.first_login_at) {
			console.log(`First login already completed for user ${userId} at ${user.first_login_at}`);
			return;
		}

		console.log(`Running ${FIRST_LOGIN_ACTIONS.length} first login actions for user ${userId}`);

		// Run all actions
		for (const action of FIRST_LOGIN_ACTIONS) {
			try {
				console.log(`Executing action: ${action.id}`);
				await action.execute(userId);
				console.log(`Successfully executed action: ${action.id}`);
			} catch (error) {
				console.error(`Failed to execute action ${action.id} for user ${userId}:`, error);
				// Continue with other actions even if one fails
			}
		}

		// Mark first login as completed
		const provider = authService as any;
		if (typeof provider.markFirstLoginCompleted === 'function') {
			await provider.markFirstLoginCompleted(userId);
			console.log(`Marked first login as completed for user ${userId}`);
		} else {
			console.warn(
				`Auth provider does not support markFirstLoginCompleted. First login completion not persisted.`
			);
		}

		console.log(`Completed first login actions for user ${userId}`);
	} catch (error) {
		console.error(`Error running first login actions for user ${userId}:`, error);
	}
}
