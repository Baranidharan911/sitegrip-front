'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import useMobileOptimizations from '@/hooks/useMobileOptimizations';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  fill?: boolean;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality,
  sizes,
  fill = false,
  style,
  onLoad,
  onError,
  placeholder = 'blur',
  blurDataURL,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const { 
    isMobile, 
    shouldLazyLoad, 
    getOptimalImageFormat,
    connectionType,
    devicePixelRatio 
  } = useMobileOptimizations();

  // Generate default blur placeholder
  const generateBlurDataURL = (w: number, h: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create a subtle gradient placeholder
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, '#f3f4f6');
      gradient.addColorStop(1, '#e5e7eb');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    }
    
    return canvas.toDataURL('image/jpeg', 0.1);
  };

  // Optimize quality based on connection and device
  const getOptimalQuality = () => {
    if (quality !== undefined) return quality;
    
    if (['slow-2g', '2g'].includes(connectionType)) {
      return 50; // Lower quality for slow connections
    }
    
    if (devicePixelRatio >= 2) {
      return 85; // Higher quality for retina displays
    }
    
    return 75; // Default quality
  };

  // Generate responsive sizes if not provided
  const getResponsiveSizes = () => {
    if (sizes) return sizes;
    
    if (isMobile) {
      return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
    }
    
    return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw';
  };

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setImageError(true);
    onError?.();
  };

  // Lazy loading intersection observer
  useEffect(() => {
    if (!shouldLazyLoad() || priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && imageRef.current) {
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => observer.disconnect();
  }, [shouldLazyLoad, priority]);

  // Error fallback
  if (imageError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}
        style={{ width, height, ...style }}
      >
        <svg 
          className="w-8 h-8 text-gray-400"
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            fillRule="evenodd" 
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" 
            clipRule="evenodd" 
          />
        </svg>
      </div>
    );
  }

  // Default blur data URL
  const defaultBlurDataURL = blurDataURL || (width && height ? generateBlurDataURL(width, height) : undefined);

  const imageProps = {
    ref: imageRef,
    src,
    alt,
    className: `${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`,
    style,
    onLoad: handleLoad,
    onError: handleError,
    quality: getOptimalQuality(),
    priority: priority || !shouldLazyLoad(),
    placeholder: placeholder as any,
    blurDataURL: defaultBlurDataURL,
    sizes: getResponsiveSizes(),
    ...props,
  };

  if (fill) {
    return (
      <Image
        {...imageProps}
        fill
      />
    );
  }

  if (width && height) {
    return (
      <Image
        {...imageProps}
        width={width}
        height={height}
      />
    );
  }

  // Auto-sized image with mobile optimization
  return (
    <Image
      {...imageProps}
      width={width || 800}
      height={height || 600}
      style={{
        width: '100%',
        height: 'auto',
        ...style,
      }}
    />
  );
};

export default OptimizedImage; 