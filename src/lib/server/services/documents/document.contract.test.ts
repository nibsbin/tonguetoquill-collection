/**
 * Contract Tests for Document Service
 * These tests run against both mock and real providers to ensure consistent behavior
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MockDocumentService } from './document-mock-service';
import { DocumentError } from '$lib/services/documents/types';

describe('DocumentServiceContract - MockDocumentService', () => {
	let documentService: MockDocumentService;
	const userId = 'user-123';
	const otherUserId = 'user-456';

	beforeEach(() => {
		documentService = new MockDocumentService();
		documentService.clearAllData();
	});

	describe('createDocument', () => {
		it('should create a new document', async () => {
			const doc = await documentService.createDocument({
				owner_id: userId,
				name: 'Test Document',
				content: '# Hello World'
			});

			expect(doc.id).toBeDefined();
			expect(doc.owner_id).toBe(userId);
			expect(doc.name).toBe('Test Document');
			expect(doc.content).toBe('# Hello World');
			expect(doc.content_size_bytes).toBeGreaterThan(0);
			expect(doc.created_at).toBeDefined();
			expect(doc.updated_at).toBeDefined();
		});

		it('should reject empty document name', async () => {
			await expect(
				documentService.createDocument({
					owner_id: userId,
					name: '',
					content: 'content'
				})
			).rejects.toThrow(DocumentError);
		});

		it('should reject document name with whitespace only', async () => {
			await expect(
				documentService.createDocument({
					owner_id: userId,
					name: '   ',
					content: 'content'
				})
			).rejects.toThrow(DocumentError);
		});

		it('should reject document name with leading/trailing whitespace', async () => {
			await expect(
				documentService.createDocument({
					owner_id: userId,
					name: '  Document Name  ',
					content: 'content'
				})
			).rejects.toThrow(DocumentError);
		});

		it('should reject document name exceeding 255 characters', async () => {
			const longName = 'a'.repeat(256);
			await expect(
				documentService.createDocument({
					owner_id: userId,
					name: longName,
					content: 'content'
				})
			).rejects.toThrow(DocumentError);
		});

		it('should reject content exceeding size limit', async () => {
			const largeContent = 'a'.repeat(524289); // Just over 0.5 MB
			await expect(
				documentService.createDocument({
					owner_id: userId,
					name: 'Large Doc',
					content: largeContent
				})
			).rejects.toThrow(DocumentError);
		});

		it('should calculate content size correctly for UTF-8', async () => {
			const doc = await documentService.createDocument({
				owner_id: userId,
				name: 'UTF-8 Test',
				content: '你好世界' // Chinese characters
			});

			// Each Chinese character is 3 bytes in UTF-8
			expect(doc.content_size_bytes).toBe(12);
		});
	});

	describe('getDocumentContent', () => {
		it('should retrieve full document with content', async () => {
			const created = await documentService.createDocument({
				owner_id: userId,
				name: 'Test Doc',
				content: '# Content'
			});

			const retrieved = await documentService.getDocumentContent({
				user_id: userId,
				document_id: created.id
			});

			expect(retrieved.id).toBe(created.id);
			expect(retrieved.content).toBe('# Content');
		});

		it('should reject access by non-owner', async () => {
			const doc = await documentService.createDocument({
				owner_id: userId,
				name: 'Private Doc',
				content: 'secret'
			});

			await expect(
				documentService.getDocumentContent({ user_id: otherUserId, document_id: doc.id })
			).rejects.toThrow(DocumentError);
		});

		it('should reject non-existent document', async () => {
			await expect(
				documentService.getDocumentContent({ user_id: userId, document_id: 'non-existent-id' })
			).rejects.toThrow(DocumentError);
		});
	});

	describe('getDocumentMetadata', () => {
		it('should retrieve metadata without content', async () => {
			const created = await documentService.createDocument({
				owner_id: userId,
				name: 'Test Doc',
				content: '# Large content here'
			});

			const metadata = await documentService.getDocumentMetadata(userId, created.id);

			expect(metadata.id).toBe(created.id);
			expect(metadata.name).toBe('Test Doc');
			expect(metadata.content_size_bytes).toBeGreaterThan(0);
			expect('content' in metadata).toBe(false); // Content field should not exist
		});
	});

	describe('updateDocumentContent', () => {
		it('should update document content', async () => {
			const doc = await documentService.createDocument({
				owner_id: userId,
				name: 'Test',
				content: 'original'
			});

			// Wait a tiny bit to ensure different timestamp
			await new Promise((resolve) => setTimeout(resolve, 10));

			const updated = await documentService.updateDocumentContent({
				user_id: userId,
				document_id: doc.id,
				content: 'updated content'
			});

			expect(updated.content).toBe('updated content');
			expect(new Date(updated.updated_at).getTime()).toBeGreaterThanOrEqual(
				new Date(doc.updated_at).getTime()
			);
		});

		it('should reject content exceeding size limit', async () => {
			const doc = await documentService.createDocument({
				owner_id: userId,
				name: 'Test',
				content: 'small'
			});

			const largeContent = 'a'.repeat(524289);
			await expect(
				documentService.updateDocumentContent({
					user_id: userId,
					document_id: doc.id,
					content: largeContent
				})
			).rejects.toThrow(DocumentError);
		});

		it('should reject update by non-owner', async () => {
			const doc = await documentService.createDocument({
				owner_id: userId,
				name: 'Test',
				content: 'original'
			});

			await expect(
				documentService.updateDocumentContent({
					user_id: otherUserId,
					document_id: doc.id,
					content: 'hacked'
				})
			).rejects.toThrow(DocumentError);
		});
	});

	describe('updateDocumentName', () => {
		it('should update document name', async () => {
			const doc = await documentService.createDocument({
				owner_id: userId,
				name: 'Original Name',
				content: 'content'
			});

			// Wait a tiny bit to ensure different timestamp
			await new Promise((resolve) => setTimeout(resolve, 10));

			const updated = await documentService.updateDocumentName({
				user_id: userId,
				document_id: doc.id,
				name: 'New Name'
			});

			expect(updated.name).toBe('New Name');
			expect(new Date(updated.updated_at).getTime()).toBeGreaterThanOrEqual(
				new Date(doc.updated_at).getTime()
			);
		});

		it('should reject invalid name', async () => {
			const doc = await documentService.createDocument({
				owner_id: userId,
				name: 'Original',
				content: 'content'
			});

			await expect(
				documentService.updateDocumentName({
					user_id: userId,
					document_id: doc.id,
					name: '  Invalid  '
				})
			).rejects.toThrow(DocumentError);
		});
	});

	describe('deleteDocument', () => {
		it('should delete document', async () => {
			const doc = await documentService.createDocument({
				owner_id: userId,
				name: 'To Delete',
				content: 'content'
			});

			await documentService.deleteDocument({ user_id: userId, document_id: doc.id });

			await expect(
				documentService.getDocumentContent({ user_id: userId, document_id: doc.id })
			).rejects.toThrow(DocumentError);
		});

		it('should reject delete by non-owner', async () => {
			const doc = await documentService.createDocument({
				owner_id: userId,
				name: 'Protected',
				content: 'content'
			});

			await expect(
				documentService.deleteDocument({ user_id: otherUserId, document_id: doc.id })
			).rejects.toThrow(DocumentError);
		});
	});

	describe('listUserDocuments', () => {
		it('should list user documents', async () => {
			await documentService.createDocument({
				owner_id: userId,
				name: 'Doc 1',
				content: 'content 1'
			});
			await documentService.createDocument({
				owner_id: userId,
				name: 'Doc 2',
				content: 'content 2'
			});
			await documentService.createDocument({
				owner_id: otherUserId,
				name: 'Other Doc',
				content: 'other content'
			});

			const result = await documentService.listUserDocuments({ user_id: userId });

			expect(result.documents).toHaveLength(2);
			expect(result.total).toBe(2);
			expect(result.documents.every((doc) => doc.owner_id === userId)).toBe(true);
			expect(result.documents[0]).not.toHaveProperty('content'); // Should be metadata only
		});

		it('should support pagination', async () => {
			for (let i = 0; i < 5; i++) {
				await documentService.createDocument({
					owner_id: userId,
					name: `Doc ${i}`,
					content: `content ${i}`
				});
			}

			const page1 = await documentService.listUserDocuments({
				user_id: userId,
				limit: 2,
				offset: 0
			});
			const page2 = await documentService.listUserDocuments({
				user_id: userId,
				limit: 2,
				offset: 2
			});

			expect(page1.documents).toHaveLength(2);
			expect(page2.documents).toHaveLength(2);
			expect(page1.total).toBe(5);
			expect(page2.total).toBe(5);
			expect(page1.documents[0].id).not.toBe(page2.documents[0].id);
		});

		it('should return empty array for user with no documents', async () => {
			const result = await documentService.listUserDocuments({ user_id: userId });

			expect(result.documents).toHaveLength(0);
			expect(result.total).toBe(0);
		});
	});
});
