/**
 * GET /api/documents/[id] - Get document with content
 * PUT /api/documents/[id] - Update document content
 * DELETE /api/documents/[id] - Delete document
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { documentService } from '$lib/server/services/documents';
import { requireAuth } from '$lib/utils/auth';
import { handleDocumentError } from '$lib/utils/api';

export const GET: RequestHandler = async (event) => {
	try {
		const user = await requireAuth(event);
		const documentId = event.params.id;

		const document = await documentService.getDocumentContent(user.id, documentId);

		return json(document);
	} catch (error) {
		return handleDocumentError(error);
	}
};

export const PUT: RequestHandler = async (event) => {
	try {
		const user = await requireAuth(event);
		const documentId = event.params.id;
		const body = await event.request.json();
		const { content, name } = body;

		// Update content if provided
		if (content !== undefined) {
			const updated = await documentService.updateDocumentContent({
				user_id: user.id,
				document_id: documentId,
				content
			});
			return json(updated);
		}

		// Update name if provided
		if (name !== undefined) {
			const updated = await documentService.updateDocumentName({
				user_id: user.id,
				document_id: documentId,
				name
			});
			return json(updated);
		}

		return json(
			{ error: 'validation_error', message: 'Either content or name must be provided' },
			{ status: 400 }
		);
	} catch (error) {
		return handleDocumentError(error);
	}
};

export const DELETE: RequestHandler = async (event) => {
	try {
		const user = await requireAuth(event);
		const documentId = event.params.id;

		await documentService.deleteDocument(user.id, documentId);

		return json({ success: true }, { status: 200 });
	} catch (error) {
		return handleDocumentError(error);
	}
};
