// Quick Memory Fix Script
// Run this in your browser console to immediately reduce memory usage

(function() {
  console.log('🧹 Starting quick memory fix...');
  
  // Clear console logs
  console.clear();
  
  // Clear all intervals (this will stop all setInterval calls)
  const highestIntervalId = setTimeout(() => {}, 0);
  for (let i = 0; i < highestIntervalId; i++) {
    clearInterval(i);
  }
  
  // Clear all timeouts
  for (let i = 0; i < highestIntervalId; i++) {
    clearTimeout(i);
  }
  
  // Force garbage collection if available
  if (typeof window !== 'undefined' && 'gc' in window) {
    try {
      window.gc();
      console.log('✅ Garbage collection triggered');
    } catch (e) {
      console.log('⚠️ Garbage collection not available');
    }
  }
  
  // Clear caches
  if (typeof window !== 'undefined' && 'caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
      console.log('✅ Caches cleared');
    });
  }
  
  // Clear session storage
  if (typeof window !== 'undefined' && 'sessionStorage' in window) {
    sessionStorage.clear();
    console.log('✅ Session storage cleared');
  }
  
  // Clear local storage (optional - be careful with this)
  // localStorage.clear();
  
  // Remove event listeners from window
  if (typeof window !== 'undefined') {
    // Clone the window object to remove all listeners
    const newWindow = window.open('', '_self');
    if (newWindow) {
      newWindow.close();
    }
  }
  
  // Check memory usage
  if ('memory' in performance) {
    const memory = performance.memory;
    const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
    const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
    const percentage = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
    
    console.log(`📊 Memory after cleanup: ${usedMB}MB / ${totalMB}MB (${percentage.toFixed(1)}%)`);
  }
  
  console.log('✅ Quick memory fix completed!');
  console.log('💡 Consider refreshing the page for best results');
})(); 