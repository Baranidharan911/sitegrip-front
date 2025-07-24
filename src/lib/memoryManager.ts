// src/lib/memoryManager.ts
// Memory management utility for preventing memory leaks and optimizing performance

interface MemoryStats {
  used: number;
  total: number;
  percentage: number;
  timestamp: number;
}

interface MemoryThresholds {
  warning: number; // 80%
  high: number;    // 90%
  critical: number; // 95%
}

class MemoryManager {
  private static instance: MemoryManager;
  private intervals: Set<NodeJS.Timeout> = new Set();
  private eventListeners: Map<string, Set<() => void>> = new Map();
  private memoryHistory: MemoryStats[] = [];
  private maxHistorySize = 50;
  private thresholds: MemoryThresholds = {
    warning: 80,
    high: 90,
    critical: 95
  };

  private constructor() {
    this.startMonitoring();
  }

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  // Get current memory usage
  getMemoryUsage(): MemoryStats | null {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return null;
    }

    const memory = (performance as any).memory;
    const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
    const total = Math.round(memory.totalJSHeapSize / 1024 / 1024);
    const percentage = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;

    const stats: MemoryStats = {
      used,
      total,
      percentage,
      timestamp: Date.now()
    };

    // Add to history
    this.memoryHistory.push(stats);
    if (this.memoryHistory.length > this.maxHistorySize) {
      this.memoryHistory.shift();
    }

    return stats;
  }

  // Register an interval for cleanup
  registerInterval(interval: NodeJS.Timeout): void {
    this.intervals.add(interval);
  }

  // Register an event listener for cleanup
  registerEventListener(event: string, cleanup: () => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(cleanup);
  }

  // Clean up all registered resources
  cleanup(): void {
    // Clear all intervals
    this.intervals.forEach(interval => {
      clearInterval(interval);
    });
    this.intervals.clear();

    // Clear all event listeners
    this.eventListeners.forEach(cleanups => {
      cleanups.forEach(cleanup => cleanup());
    });
    this.eventListeners.clear();

    // Clear console logs
    if (process.env.NODE_ENV === 'development') {
      console.clear();
    }

    // Force garbage collection if available
    if (typeof window !== 'undefined' && 'gc' in window) {
      try {
        (window as any).gc();
      } catch (e) {
        // GC not available
      }
    }

    // Clear caches
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('performance') || name.includes('monitor')) {
            caches.delete(name);
          }
        });
      });
    }

    // Clear memory history
    this.memoryHistory = [];

    console.log('🧹 Memory cleanup completed');
  }

  // Check if memory usage is critical
  isMemoryCritical(): boolean {
    const stats = this.getMemoryUsage();
    return stats ? stats.percentage >= this.thresholds.critical : false;
  }

  // Get memory usage trend
  getMemoryTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.memoryHistory.length < 3) return 'stable';

    const recent = this.memoryHistory.slice(-3);
    const first = recent[0].percentage;
    const last = recent[recent.length - 1].percentage;
    const diff = last - first;

    if (diff > 5) return 'increasing';
    if (diff < -5) return 'decreasing';
    return 'stable';
  }

  // Optimize memory usage
  optimize(): void {
    const stats = this.getMemoryUsage();
    if (!stats) return;

    if (stats.percentage > this.thresholds.high) {
      console.warn(`🚨 High memory usage detected: ${stats.percentage.toFixed(1)}%`);
      this.cleanup();
    } else if (stats.percentage > this.thresholds.warning) {
      console.warn(`⚠️ Elevated memory usage: ${stats.percentage.toFixed(1)}%`);
      
      // Partial cleanup
      this.clearConsoleLogs();
      this.clearOldCache();
    }
  }

  // Set custom thresholds
  setThresholds(thresholds: Partial<MemoryThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  // Get memory statistics
  getStats(): {
    current: MemoryStats | null;
    trend: 'increasing' | 'decreasing' | 'stable';
    history: MemoryStats[];
    intervals: number;
    eventListeners: number;
  } {
    return {
      current: this.getMemoryUsage(),
      trend: this.getMemoryTrend(),
      history: [...this.memoryHistory],
      intervals: this.intervals.size,
      eventListeners: Array.from(this.eventListeners.values()).reduce((sum, set) => sum + set.size, 0)
    };
  }

  private startMonitoring(): void {
    // Monitor memory every 30 seconds
    const interval = setInterval(() => {
      this.optimize();
    }, 30000);

    this.registerInterval(interval);

    // Cleanup on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.cleanup();
      });
    }
  }

  private clearConsoleLogs(): void {
    if (process.env.NODE_ENV === 'development') {
      console.clear();
    }
  }

  private clearOldCache(): void {
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('performance') || name.includes('monitor')) {
            caches.delete(name);
          }
        });
      });
    }
  }
}

// Export singleton instance
export const memoryManager = MemoryManager.getInstance();

// Utility functions for easy access
export const memoryUtils = {
  // Get current memory usage
  getUsage: () => memoryManager.getMemoryUsage(),
  
  // Check if memory is critical
  isCritical: () => memoryManager.isMemoryCritical(),
  
  // Get memory trend
  getTrend: () => memoryManager.getMemoryTrend(),
  
  // Optimize memory
  optimize: () => memoryManager.optimize(),
  
  // Clean up memory
  cleanup: () => memoryManager.cleanup(),
  
  // Register interval for cleanup
  registerInterval: (interval: NodeJS.Timeout) => memoryManager.registerInterval(interval),
  
  // Register event listener for cleanup
  registerEventListener: (event: string, cleanup: () => void) => 
    memoryManager.registerEventListener(event, cleanup),
  
  // Get comprehensive stats
  getStats: () => memoryManager.getStats(),
  
  // Set custom thresholds
  setThresholds: (thresholds: Partial<MemoryThresholds>) => memoryManager.setThresholds(thresholds)
};

export default MemoryManager; 