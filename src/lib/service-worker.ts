// Service Worker registration and management

interface ServiceWorkerConfig {
  enabled: boolean;
  updateInterval: number;
  showUpdatePrompt: boolean;
}

class ServiceWorkerManager {
  private config: ServiceWorkerConfig;
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailable = false;

  constructor(config: Partial<ServiceWorkerConfig> = {}) {
    this.config = {
      enabled: true,
      updateInterval: 60000, // Check for updates every minute
      showUpdatePrompt: true,
      ...config,
    };
  }

  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!this.config.enabled || typeof window === 'undefined') {
      return null;
    }

    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('Service Worker registered successfully');

      // Set up event listeners
      this.setupEventListeners();

      // Check for updates periodically
      this.startUpdateCheck();

      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  private setupEventListeners() {
    if (!this.registration) return;

    // Listen for updates
    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration!.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          this.updateAvailable = true;
          this.handleUpdateAvailable();
        }
      });
    });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      this.handleMessage(event.data);
    });

    // Listen for controller changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service Worker controller changed');
      // Reload the page to get the latest version
      window.location.reload();
    });
  }

  private handleUpdateAvailable() {
    if (this.config.showUpdatePrompt) {
      this.showUpdatePrompt();
    } else {
      // Auto-update without prompt
      this.applyUpdate();
    }
  }

  private showUpdatePrompt() {
    // Create a simple update prompt
    const updatePrompt = document.createElement('div');
    updatePrompt.className = 'sw-update-prompt';
    updatePrompt.innerHTML = `
      <div class="sw-update-content">
        <p>A new version is available!</p>
        <button id="sw-update-btn">Update Now</button>
        <button id="sw-dismiss-btn">Later</button>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .sw-update-prompt {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: hsl(var(--card));
        border: 1px solid hsl(var(--border));
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        max-width: 300px;
      }
      .sw-update-content p {
        margin: 0 0 12px 0;
        color: hsl(var(--foreground));
      }
      .sw-update-content button {
        margin-right: 8px;
        padding: 6px 12px;
        border: 1px solid hsl(var(--border));
        border-radius: 4px;
        background: hsl(var(--background));
        color: hsl(var(--foreground));
        cursor: pointer;
      }
      #sw-update-btn {
        background: hsl(var(--primary));
        color: hsl(var(--primary-foreground));
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(updatePrompt);

    // Handle button clicks
    document.getElementById('sw-update-btn')?.addEventListener('click', () => {
      this.applyUpdate();
      updatePrompt.remove();
    });

    document.getElementById('sw-dismiss-btn')?.addEventListener('click', () => {
      updatePrompt.remove();
    });
  }

  private applyUpdate() {
    if (!this.registration?.waiting) return;

    // Tell the waiting service worker to skip waiting
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  private startUpdateCheck() {
    setInterval(() => {
      this.checkForUpdates();
    }, this.config.updateInterval);
  }

  private async checkForUpdates() {
    if (!this.registration) return;

    try {
      await this.registration.update();
    } catch (error) {
      console.error('Failed to check for service worker updates:', error);
    }
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case 'VERSION':
        console.log('Service Worker version:', data.version);
        break;
      default:
        console.log('Service Worker message:', data);
    }
  }

  async unregister(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      const result = await this.registration.unregister();
      console.log('Service Worker unregistered');
      return result;
    } catch (error) {
      console.error('Failed to unregister service worker:', error);
      return false;
    }
  }

  isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }
}

// Singleton instance
let swManager: ServiceWorkerManager | null = null;

export function initializeServiceWorker(config?: Partial<ServiceWorkerConfig>) {
  if (typeof window === 'undefined') return null;

  if (!swManager) {
    swManager = new ServiceWorkerManager(config);
  }

  return swManager;
}

export function registerServiceWorker(config?: Partial<ServiceWorkerConfig>) {
  const manager = initializeServiceWorker(config);
  return manager?.register();
}

export function getServiceWorkerManager() {
  return swManager;
}

// Utility functions for cache management
export async function clearCache(cacheName?: string) {
  if (typeof caches === 'undefined') return false;

  try {
    if (cacheName) {
      return await caches.delete(cacheName);
    } else {
      const cacheNames = await caches.keys();
      const deletePromises = cacheNames.map(name => caches.delete(name));
      await Promise.all(deletePromises);
      return true;
    }
  } catch (error) {
    console.error('Failed to clear cache:', error);
    return false;
  }
}

export async function getCacheSize(): Promise<number> {
  if (typeof caches === 'undefined') return 0;

  try {
    const cacheNames = await caches.keys();
    let totalSize = 0;

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }

    return totalSize;
  } catch (error) {
    console.error('Failed to calculate cache size:', error);
    return 0;
  }
}

export default ServiceWorkerManager;