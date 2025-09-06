/**
 * Touch Optimization Utilities for Mobile Landing Page
 * Implements proper touch target sizes, swipe gestures, and haptic feedback
 */

export interface TouchConfig {
  minTouchTarget: number;
  swipeThreshold: number;
  hapticEnabled: boolean;
}

export const TOUCH_CONFIG: TouchConfig = {
  minTouchTarget: 44, // Minimum 44px touch targets per accessibility guidelines
  swipeThreshold: 50, // Minimum swipe distance in pixels
  hapticEnabled: typeof navigator !== 'undefined' && 'vibrate' in navigator,
};

/**
 * Ensures element meets minimum touch target size
 */
export function ensureTouchTarget(element: HTMLElement): void {
  const rect = element.getBoundingClientRect();
  const { minTouchTarget } = TOUCH_CONFIG;
  
  if (rect.width < minTouchTarget || rect.height < minTouchTarget) {
    const paddingX = Math.max(0, (minTouchTarget - rect.width) / 2);
    const paddingY = Math.max(0, (minTouchTarget - rect.height) / 2);
    
    element.style.padding = `${paddingY}px ${paddingX}px`;
    element.style.minWidth = `${minTouchTarget}px`;
    element.style.minHeight = `${minTouchTarget}px`;
  }
}

/**
 * Haptic feedback for touch interactions
 */
export function triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light'): void {
  if (!TOUCH_CONFIG.hapticEnabled) return;
  
  const patterns = {
    light: [10],
    medium: [20],
    heavy: [30],
  };
  
  try {
    navigator.vibrate(patterns[type]);
  } catch (error) {
    // Silently fail if vibration is not supported
  }
}

/**
 * Swipe gesture detection
 */
export interface SwipeEvent {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  duration: number;
}

export class SwipeDetector {
  private startX = 0;
  private startY = 0;
  private startTime = 0;
  private element: HTMLElement;
  private onSwipe: (event: SwipeEvent) => void;

  constructor(element: HTMLElement, onSwipe: (event: SwipeEvent) => void) {
    this.element = element;
    this.onSwipe = onSwipe;
    this.attachListeners();
  }

  private attachListeners(): void {
    // Use passive listeners for better scroll performance
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
  }

  private handleTouchStart(e: TouchEvent): void {
    const touch = e.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.startTime = Date.now();
  }

  private handleTouchEnd(e: TouchEvent): void {
    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    const endTime = Date.now();

    const deltaX = endX - this.startX;
    const deltaY = endY - this.startY;
    const duration = endTime - this.startTime;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance < TOUCH_CONFIG.swipeThreshold) return;

    let direction: SwipeEvent['direction'];
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }

    this.onSwipe({ direction, distance, duration });
    triggerHapticFeedback('light');
  }

  destroy(): void {
    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this));
  }
}

/**
 * Touch-friendly hover alternatives
 */
export function createTouchHover(element: HTMLElement): void {
  let isPressed = false;

  const handleTouchStart = () => {
    isPressed = true;
    element.classList.add('touch-active');
    triggerHapticFeedback('light');
  };

  const handleTouchEnd = () => {
    if (isPressed) {
      isPressed = false;
      element.classList.remove('touch-active');
      
      // Delay to show the effect
      setTimeout(() => {
        element.classList.add('touch-reveal');
      }, 100);
    }
  };

  const handleTouchCancel = () => {
    isPressed = false;
    element.classList.remove('touch-active');
  };

  element.addEventListener('touchstart', handleTouchStart, { passive: true });
  element.addEventListener('touchend', handleTouchEnd, { passive: true });
  element.addEventListener('touchcancel', handleTouchCancel, { passive: true });
}

/**
 * Optimize scroll performance with passive listeners
 */
export function optimizeScrollPerformance(): void {
  // Add passive event listeners for better scroll performance
  const passiveSupported = (() => {
    let passive = false;
    try {
      const options = {
        get passive() {
          passive = true;
          return false;
        }
      };
      window.addEventListener('test', () => {}, options);
      window.removeEventListener('test', () => {}, options);
    } catch (err) {
      passive = false;
    }
    return passive;
  })();

  if (passiveSupported) {
    // Override default scroll listeners to be passive
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if (type === 'scroll' || type === 'touchstart' || type === 'touchmove') {
        if (typeof options === 'boolean') {
          options = { passive: true, capture: options };
        } else if (typeof options === 'object') {
          options = { ...options, passive: true };
        } else {
          options = { passive: true };
        }
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
  }
}

/**
 * Mobile-specific layout utilities
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function getViewportSize(): { width: number; height: number } {
  return {
    width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
    height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
  };
}

export function isLandscape(): boolean {
  const { width, height } = getViewportSize();
  return width > height;
}

/**
 * Touch-optimized carousel navigation
 */
export class TouchCarousel {
  private container: HTMLElement;
  private items: HTMLElement[];
  private currentIndex = 0;
  private swipeDetector: SwipeDetector;

  constructor(container: HTMLElement) {
    this.container = container;
    this.items = Array.from(container.children) as HTMLElement[];
    this.swipeDetector = new SwipeDetector(container, this.handleSwipe.bind(this));
    this.setupTouchTargets();
  }

  private setupTouchTargets(): void {
    // Ensure navigation buttons meet touch target requirements
    const navButtons = this.container.querySelectorAll('[data-carousel-nav]');
    navButtons.forEach(button => {
      if (button instanceof HTMLElement) {
        ensureTouchTarget(button);
      }
    });
  }

  private handleSwipe(event: SwipeEvent): void {
    if (event.direction === 'left') {
      this.next();
    } else if (event.direction === 'right') {
      this.previous();
    }
  }

  next(): void {
    if (this.currentIndex < this.items.length - 1) {
      this.currentIndex++;
      this.updatePosition();
      triggerHapticFeedback('medium');
    }
  }

  previous(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updatePosition();
      triggerHapticFeedback('medium');
    }
  }

  private updatePosition(): void {
    const translateX = -this.currentIndex * 100;
    this.container.style.transform = `translateX(${translateX}%)`;
  }

  destroy(): void {
    this.swipeDetector.destroy();
  }
}