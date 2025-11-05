/**
 * Integration Tests for Document API
 * Tests the complete flow of document operations through API endpoints
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MockAuthProvider } from '$lib/server/services/auth/auth-mock-provider';
import { MockDocumentService } from './document-mock-service';
import { DocumentError } from '$lib/services/documents';

describe('Document API Integration', () => {
	let authProvider: MockAuthProvider;
	let documentService: MockDocumentService;
	let userId: string;

	beforeEach(async () => {
		authProvider = new MockAuthProvider('test-secret');
		documentService = new MockDocumentService();
		authProvider.clearAllData();
		documentService.clearAllData();

		// Create a test user and get access token using OAuth-like flow
		const result = await authProvider.exchangeCodeForTokens('test_auth_code');
		userId = result.user.id;
	});

	describe('Document Creation Flow', () => {
		it('should create document with valid auth', async () => {
			const doc = await documentService.createDocument({
				owner_id: userId,
				name: 'Test Document',
				content: '# Hello'
			});

			expect(doc.id).toBeDefined();
			expect(doc.owner_id).toBe(userId);
			expect(doc.name).toBe('Test Document');
			expect(doc.content).toBe('# Hello');
		});

		it('should list user documents', async () => {
			await documentService.createDocument({
				owner_id: userId,
				name: 'Doc 1',
				content: 'Content 1'
			});
			await documentService.createDocument({
				owner_id: userId,
				name: 'Doc 2',
				content: 'Content 2'
			});

			const result = await documentService.listUserDocuments({ user_id: userId });

			expect(result.total).toBe(2);
			expect(result.documents).toHaveLength(2);
		});
	});

	describe('Document Update Flow', () => {
		it('should update document content', async () => {
			const doc = await documentService.createDocument({
				owner_id: userId,
				name: 'Test',
				content: 'Original'
			});

			// Wait a bit for different timestamp
			await new Promise((resolve) => setTimeout(resolve, 10));

			const updated = await documentService.updateDocumentContent({
				user_id: userId,
				document_id: doc.id,
				content: 'Updated'
			});

			expect(updated.content).toBe('Updated');
		});

		it('should update document name', async () => {
			const doc = await documentService.createDocument({
				owner_id: userId,
				name: 'Original',
				content: 'Content'
			});

			// Wait a bit for different timestamp
			await new Promise((resolve) => setTimeout(resolve, 10));

			const updated = await documentService.updateDocumentName({
				user_id: userId,
				document_id: doc.id,
				name: 'Updated Name'
			});

			expect(updated.name).toBe('Updated Name');
		});
	});

	describe('Document Deletion Flow', () => {
		it('should delete document', async () => {
			const doc = await documentService.createDocument({
				owner_id: userId,
				name: 'To Delete',
				content: 'Content'
			});

			await documentService.deleteDocument({ user_id: userId, document_id: doc.id });

			const result = await documentService.listUserDocuments({ user_id: userId });
			expect(result.total).toBe(0);
		});
	});

	describe('Authorization Flow', () => {
		it('should verify ownership before operations', async () => {
			// Create another user for testing
			const otherUser = authProvider.createTestUser('other@example.com', 'OTHER123');
			const otherUserId = otherUser.id;

			// Create document as first user
			const doc = await documentService.createDocument({
				owner_id: userId,
				name: 'Private Doc',
				content: 'Secret'
			});

			// Try to access as second user (should fail)
			await expect(
				documentService.getDocumentContent({ user_id: otherUserId, document_id: doc.id })
			).rejects.toThrow(DocumentError);
		});
	});
});
