/**
 * Store Factory Functions
 *
 * Reusable factory functions that eliminate store boilerplate by encapsulating
 * common patterns. See prose/designs/patterns/STATE_PATTERNS.md for design.
 *
 * Three factory patterns:
 * 1. CollectionStore - Array-based with CRUD, loading/error, active selection
 * 2. RegistryStore - Map-based with register/unregister lifecycle
 * 3. SimpleState - Primitive or simple object state with getters/setters
 */

// ============================================================================
// Collection Store Factory
// ============================================================================

/**
 * Configuration for collection store factory
 */
export interface CollectionStoreConfig<T> {
	/** Key name used for item IDs (e.g., 'id') */
	idKey: keyof T;
	/** Initial items (default: []) */
	initialItems?: T[];
	/** Enable loading state tracking (default: false) */
	withLoading?: boolean;
	/** Enable error state tracking (default: false) */
	withError?: boolean;
	/** Enable active item selection (default: false) */
	withActiveSelection?: boolean;
}

/**
 * Collection store class with CRUD operations and optional loading/error/active states
 */
export class CollectionStore<T> {
	private _items = $state<T[]>([]);
	private _activeId = $state<string | null>(null);
	private _isLoading = $state<boolean>(false);
	private _error = $state<string | null>(null);

	private config: Required<CollectionStoreConfig<T>>;

	constructor(config: CollectionStoreConfig<T>) {
		this.config = {
			idKey: config.idKey,
			initialItems: config.initialItems ?? [],
			withLoading: config.withLoading ?? false,
			withError: config.withError ?? false,
			withActiveSelection: config.withActiveSelection ?? false
		};
		this._items = this.config.initialItems;
	}

	// Getters
	get items(): T[] {
		return this._items;
	}

	get activeId(): string | null {
		return this.config.withActiveSelection ? this._activeId : null;
	}

	get activeItem(): T | null {
		if (!this.config.withActiveSelection || !this._activeId) return null;
		return this._items.find((item) => item[this.config.idKey] === this._activeId) ?? null;
	}

	get isLoading(): boolean {
		return this.config.withLoading ? this._isLoading : false;
	}

	get error(): string | null {
		return this.config.withError ? this._error : null;
	}

	// Setters
	setItems(items: T[]): void {
		this._items = items;
	}

	setActiveId(id: string | null): void {
		if (this.config.withActiveSelection) {
			this._activeId = id;
		}
	}

	setLoading(isLoading: boolean): void {
		if (this.config.withLoading) {
			this._isLoading = isLoading;
		}
	}

	setError(error: string | null): void {
		if (this.config.withError) {
			this._error = error;
		}
	}

	// CRUD Operations
	add(item: T): void {
		this._items = [item, ...this._items];
	}

	update(id: string, updates: Partial<T>): void {
		this._items = this._items.map((item) =>
			item[this.config.idKey] === id ? { ...item, ...updates } : item
		);
	}

	remove(id: string): void {
		this._items = this._items.filter((item) => item[this.config.idKey] !== id);

		// If removing active item, clear selection
		if (this.config.withActiveSelection && this._activeId === id) {
			this._activeId = null;
		}
	}

	clear(): void {
		this._items = [];
		if (this.config.withActiveSelection) {
			this._activeId = null;
		}
		if (this.config.withError) {
			this._error = null;
		}
	}
}

/**
 * Create a collection store with CRUD operations and optional loading/error/active states
 *
 * @example
 * const store = createCollectionStore<Document>({
 *   idKey: 'id',
 *   withLoading: true,
 *   withError: true,
 *   withActiveSelection: true
 * });
 */
export function createCollectionStore<T>(config: CollectionStoreConfig<T>): CollectionStore<T> {
	return new CollectionStore(config);
}

// ============================================================================
// Registry Store Factory
// ============================================================================

/**
 * Configuration for registry store factory
 */
export interface RegistryStoreConfig<T> {
	/** Initial registry entries (default: empty Map) */
	initialEntries?: Map<string, T>;
	/** Callback invoked when item is registered */
	onRegister?: (id: string, item: T) => void;
	/** Callback invoked when item is unregistered */
	onUnregister?: (id: string) => void;
}

/**
 * Registry store class with Map-based storage and lifecycle hooks
 */
export class RegistryStore<T> {
	private _registry = $state<Map<string, T>>(new Map());
	private config: RegistryStoreConfig<T>;

	constructor(config: RegistryStoreConfig<T> = {}) {
		this.config = config;
		if (config.initialEntries) {
			this._registry = new Map(config.initialEntries);
		}
	}

	// Core operations
	register(id: string, item: T): void {
		this._registry.set(id, item);
		this.config.onRegister?.(id, item);
	}

	unregister(id: string): void {
		this._registry.delete(id);
		this.config.onUnregister?.(id);
	}

	has(id: string): boolean {
		return this._registry.has(id);
	}

	get(id: string): T | undefined {
		return this._registry.get(id);
	}

	getAll(): T[] {
		return Array.from(this._registry.values());
	}

	clear(): void {
		const ids = Array.from(this._registry.keys());
		this._registry.clear();
		// Trigger cleanup for all items
		ids.forEach((id) => this.config.onUnregister?.(id));
	}

	// Queries
	get count(): number {
		return this._registry.size;
	}

	get isEmpty(): boolean {
		return this._registry.size === 0;
	}

	// Iterator support
	entries(): IterableIterator<[string, T]> {
		return this._registry.entries();
	}

	keys(): IterableIterator<string> {
		return this._registry.keys();
	}

	values(): IterableIterator<T> {
		return this._registry.values();
	}
}

/**
 * Create a registry store with Map-based storage and lifecycle hooks
 *
 * @example
 * const store = createRegistryStore<Overlay>({
 *   onRegister: (id, item) => console.log('Registered:', id),
 *   onUnregister: (id) => console.log('Unregistered:', id)
 * });
 */
export function createRegistryStore<T>(config?: RegistryStoreConfig<T>): RegistryStore<T> {
	return new RegistryStore(config);
}

// ============================================================================
// Simple State Factory
// ============================================================================

/**
 * Configuration for simple state factory
 */
export interface SimpleStateConfig<T> {
	/** Initial value */
	initialValue: T;
	/** Enable localStorage persistence (key to use) */
	persistKey?: string;
	/** Callback invoked when value changes */
	onChange?: (value: T) => void;
}

/**
 * Simple state store for primitive or simple object values
 */
export class SimpleState<T> {
	private _value = $state<T>() as T;
	private config: SimpleStateConfig<T>;

	constructor(config: SimpleStateConfig<T>) {
		this.config = config;

		// Load from localStorage if persistence enabled
		if (config.persistKey) {
			const stored = this.loadFromStorage();
			this._value = stored ?? config.initialValue;
		} else {
			this._value = config.initialValue;
		}
	}

	get value(): T {
		return this._value;
	}

	set(value: T): void {
		this._value = value;
		this.config.onChange?.(value);

		// Persist to localStorage if enabled
		if (this.config.persistKey) {
			this.saveToStorage(value);
		}
	}

	update(updater: (current: T) => T): void {
		this.set(updater(this._value));
	}

	// Helper for boolean states
	toggle(): void {
		if (typeof this._value === 'boolean') {
			this.set(!this._value as T);
		}
	}

	// LocalStorage helpers
	private loadFromStorage(): T | null {
		if (typeof window === 'undefined' || !this.config.persistKey) return null;

		try {
			const stored = localStorage.getItem(this.config.persistKey);
			return stored ? JSON.parse(stored) : null;
		} catch {
			return null;
		}
	}

	private saveToStorage(value: T): void {
		if (typeof window === 'undefined' || !this.config.persistKey) return;

		try {
			localStorage.setItem(this.config.persistKey, JSON.stringify(value));
		} catch {
			// Silently fail on storage errors (quota exceeded, etc.)
		}
	}
}

/**
 * Create a simple state store for primitive or simple object values
 *
 * @example
 * // Boolean state with toggle
 * const isActive = createSimpleState({ initialValue: false });
 * isActive.toggle();
 *
 * @example
 * // Persisted state
 * const theme = createSimpleState({
 *   initialValue: 'light',
 *   persistKey: 'app_theme'
 * });
 */
export function createSimpleState<T>(config: SimpleStateConfig<T>): SimpleState<T> {
	return new SimpleState(config);
}
