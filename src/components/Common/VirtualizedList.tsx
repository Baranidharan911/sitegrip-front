'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  className?: string;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
}

function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  className = '',
  overscan = 5,
  onScroll
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Calculate total height and offset
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  // Visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  // Handle scroll with throttling
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setScrollTop(scrollTop);
    onScroll?.(scrollTop);
  }, [onScroll]);

  // Optimized scroll handler with RAF
  const optimizedScrollHandler = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    requestAnimationFrame(() => handleScroll(e));
  }, [handleScroll]);

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={optimizedScrollHandler}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={visibleRange.startIndex + index}
              style={{ height: itemHeight }}
              className="flex items-center"
            >
              {renderItem(item, visibleRange.startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Memoized export for performance
export default React.memo(VirtualizedList) as typeof VirtualizedList;

// Higher-order component for easy virtualization
export function withVirtualization<T>(
  Component: React.ComponentType<{ items: T[]; [key: string]: any }>,
  itemHeight: number,
  containerHeight: number
) {
  return React.memo((props: { items: T[]; [key: string]: any }) => {
    const renderItem = useCallback((item: T, index: number) => (
      <Component {...props} items={[item]} itemIndex={index} />
    ), [props]);

    return (
      <VirtualizedList
        items={props.items}
        renderItem={renderItem}
        itemHeight={itemHeight}
        containerHeight={containerHeight}
      />
    );
  });
}

// Hook for virtualization state
export function useVirtualization(
  itemCount: number,
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 5);
    const endIndex = Math.min(
      itemCount - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + 5
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, itemCount]);

  return {
    scrollTop,
    setScrollTop,
    visibleRange,
    totalHeight: itemCount * itemHeight,
    offsetY: visibleRange.startIndex * itemHeight,
  };
} 