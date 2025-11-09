/**
 * POST /api/documents - Create new document
 * GET /api/documents - List user's documents
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { documentService } from '$lib/server/services/documents';
import { requireAuth } from '$lib/server/utils/auth';
import { handleServiceError } from '$lib/server/utils/api';

export const POST: RequestHandler = async (event) => {
	try {
		const user = await requireAuth(event);
		const body = await event.request.json();
		const { name, content } = body;

		if (!name) {
			return json(
				{ error: 'validation_error', message: 'Document name is required' },
				{ status: 400 }
			);
		}

		const document = await documentService.createDocument({
			user_id: user.id,
			name,
			content: content || ''
		});

		return json(document, { status: 201 });
	} catch (error) {
		return handleServiceError(error);
	}
};

export const GET: RequestHandler = async (event) => {
	try {
		const user = await requireAuth(event);
		const url = new URL(event.request.url);
		const limit = parseInt(url.searchParams.get('limit') || '50');
		const offset = parseInt(url.searchParams.get('offset') || '0');

		const result = await documentService.listUserDocuments({
			user_id: user.id,
			limit,
			offset
		});

		return json(result);
	} catch (error) {
		return handleServiceError(error);
	}
};
