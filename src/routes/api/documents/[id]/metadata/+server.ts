/**
 * GET /api/documents/[id]/metadata - Get document metadata only (no content)
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { documentService } from '$lib/services/documents';
import { requireAuth } from '$lib/utils/auth';
import { handleDocumentError } from '$lib/utils/api';

export const GET: RequestHandler = async (event) => {
	try {
		const user = await requireAuth(event);
		const documentId = event.params.id;

		const metadata = await documentService.getDocumentMetadata(user.id, documentId);

		return json(metadata);
	} catch (error) {
		return handleDocumentError(error);
	}
};
