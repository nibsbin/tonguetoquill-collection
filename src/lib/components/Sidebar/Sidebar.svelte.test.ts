import { page } from '@vitest/browser/context';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Sidebar from './Sidebar.svelte';
import { documentStore } from '$lib/stores/documents.svelte';

// Mock the document store
vi.mock('$lib/stores/documents.svelte', () => ({
	documentStore: {
		documents: [],
		activeDocumentId: null,
		createDocument: vi.fn(),
		deleteDocument: vi.fn(),
		setActiveDocumentId: vi.fn()
	}
}));

// Mock the login client
vi.mock('$lib/services/auth', () => ({
	loginClient: {
		initiateLogin: vi.fn(),
		signOut: vi.fn()
	}
}));

describe('Sidebar', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(documentStore).documents = [];
		vi.mocked(documentStore).activeDocumentId = null;
		// Mock localStorage
		const localStorageMock = {
			getItem: vi.fn(),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn()
		};
		Object.defineProperty(window, 'localStorage', {
			value: localStorageMock,
			writable: true
		});
	});

	it('should render sidebar navigation', async () => {
		render(Sidebar);
		const sidebar = page.getByRole('navigation', { name: 'Document sidebar' });
		await expect.element(sidebar).toBeInTheDocument();
	});

	it('should render new document button', async () => {
		render(Sidebar);
		const newDocButton = page.getByRole('button', { name: 'Create new document' });
		await expect.element(newDocButton).toBeInTheDocument();
	});

	it('should render settings button', async () => {
		render(Sidebar);
		// Settings is a popover trigger, not a regular button
		const settingsButton = page.getByRole('button', { name: /Settings/i });
		await expect.element(settingsButton).toBeInTheDocument();
	});

	it('should render sign in button when no user', async () => {
		render(Sidebar, { user: null });
		const signInButton = page.getByRole('button', { name: 'Sign in to your account' });
		await expect.element(signInButton).toBeInTheDocument();
	});

	it('should render user profile when user is logged in', async () => {
		render(Sidebar, {
			user: { email: 'test@example.com', id: 'user-123' }
		});
		const profileButton = page.getByRole('button', { name: /User profile/i });
		await expect.element(profileButton).toBeInTheDocument();
	});
});
