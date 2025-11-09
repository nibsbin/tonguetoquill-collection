/**
 * Client Service Base Class
 *
 * Provides shared singleton pattern, async initialization lifecycle, and ready state
 * management for browser-based services.
 *
 * @see prose/designs/patterns/CLIENT_SERVICE_FRAMEWORK.md for design documentation
 */

import { getErrorMessage } from '$lib/errors';

/**
 * Error thrown when client service initialization fails
 */
export class ClientServiceError extends Error {
	constructor(
		public serviceName: string,
		message: string,
		public cause?: unknown
	) {
		super(message);
		this.name = 'ClientServiceError';
	}
}

/**
 * Abstract base class for client-side singleton services with async initialization.
 *
 * Provides:
 * - Singleton pattern with getInstance()
 * - Idempotent async initialization
 * - Ready state tracking
 * - Validation helpers
 *
 * Subclasses must:
 * - Implement doInitialize() for resource loading
 * - Call validateInitialized() in public methods
 *
 * @example
 * ```typescript
 * class MyService extends ClientService<MyService> {
 *   protected async doInitialize(): Promise<void> {
 *     // Load resources
 *   }
 *
 *   async myOperation(): Promise<void> {
 *     this.validateInitialized();
 *     // Operation logic
 *   }
 * }
 *
 * const myService = MyService.getInstance();
 * await myService.initialize();
 * ```
 */
export abstract class ClientService<TService> {
	/**
	 * Map of service instances keyed by class name
	 * Allows each subclass to have its own singleton instance
	 */
	private static instances = new Map<string, any>();

	/**
	 * Initialization state flag
	 */
	private initialized = false;

	/**
	 * Protected constructor enforces singleton pattern
	 * Subclasses should not override - use doInitialize() for setup logic
	 */
	protected constructor() {}

	/**
	 * Get singleton instance of the service
	 *
	 * Creates instance on first call, returns existing instance on subsequent calls.
	 * Each service class gets its own singleton instance.
	 *
	 * @returns Singleton instance of the service
	 */
	static getInstance<T extends ClientService<any>>(this: new () => T): T {
		const className = this.name;

		if (!ClientService.instances.has(className)) {
			ClientService.instances.set(className, new this());
		}

		return ClientService.instances.get(className) as T;
	}

	/**
	 * Initialize the service
	 *
	 * Idempotent: Multiple calls are safe (returns immediately if already initialized).
	 * Subclasses implement doInitialize() for actual initialization logic.
	 *
	 * @throws {ClientServiceError} If initialization fails
	 */
	async initialize(): Promise<void> {
		if (this.initialized) {
			return;
		}

		try {
			await this.doInitialize();
			this.initialized = true;
		} catch (error) {
			const serviceName = this.constructor.name;
			const message = getErrorMessage(error, 'Unknown error');
			throw new ClientServiceError(
				serviceName,
				`Failed to initialize ${serviceName}: ${message}`,
				error
			);
		}
	}

	/**
	 * Abstract initialization hook for subclasses
	 *
	 * Subclasses implement this method to perform their specific initialization logic:
	 * - Load external resources (WASM, manifests, etc.)
	 * - Set up internal state
	 * - Validate configuration
	 *
	 * Called by initialize() wrapper, which handles:
	 * - Idempotency checks
	 * - Error wrapping
	 * - State flag management
	 *
	 * @throws Error if initialization fails (will be wrapped in ClientServiceError)
	 */
	protected abstract doInitialize(): Promise<void>;

	/**
	 * Check if service is ready for use
	 *
	 * Subclasses can override to add additional ready state checks beyond initialization.
	 * Base implementation checks initialization flag.
	 *
	 * @returns true if service is initialized and ready, false otherwise
	 */
	isReady(): boolean {
		return this.initialized;
	}

	/**
	 * Validate that service is initialized
	 *
	 * Helper method for subclasses to call in public methods to ensure initialization.
	 * Throws descriptive error if service not initialized.
	 *
	 * @throws {ClientServiceError} If service is not initialized
	 */
	protected validateInitialized(): void {
		if (!this.initialized) {
			const serviceName = this.constructor.name;
			throw new ClientServiceError(
				serviceName,
				`${serviceName} is not initialized. Call initialize() first.`
			);
		}
	}
}
