"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MonitorSmartphone, Smartphone, Tablet, Laptop, Monitor, XCircle, Loader2, RotateCw, ZoomIn, ZoomOut, Sun, Moon } from 'lucide-react';
import React, { useRef } from 'react';

export const dynamic = 'force-dynamic';

interface DevicePreset {
  name: string;
  width: number;
  height: number;
}

const devicePresets: { category: string; items: DevicePreset[] }[] = [
  {
    category: 'Android smartphones',
    items: [
      { name: 'Samsung Galaxy S20', width: 360, height: 800 },
      { name: 'Xiaomi Mi 11i', width: 360, height: 800 },
      { name: 'Huawei P30 Pro', width: 360, height: 780 },
      { name: 'Google Pixel 5', width: 393, height: 851 },
      { name: 'OnePlus Nord 2', width: 412, height: 915 },
      { name: 'Galaxy Z Flip3', width: 360, height: 780 },
      { name: 'OPPO Find X3 Pro', width: 412, height: 915 },
      { name: 'Galaxy A12', width: 360, height: 800 },
      { name: 'Galaxy S21 Ultra', width: 384, height: 854 },
      { name: 'Google Pixel 6 Pro', width: 411, height: 823 },
      { name: 'Xiaomi 12', width: 390, height: 844 },
      { name: 'Galaxy Note20 Ultra', width: 412, height: 915 },
      { name: 'Galaxy S22', width: 360, height: 780 },
      { name: 'Galaxy S22+', width: 392, height: 852 },
      { name: 'Galaxy S22 Ultra', width: 384, height: 854 },
      { name: 'Google Pixel 8', width: 412, height: 915 },
      { name: 'Samsung Galaxy S24', width: 384, height: 854 },
      { name: 'Galaxy S24 Ultra', width: 412, height: 915 },
    ],
  },
  {
    category: 'Apple smartphones',
    items: [
      { name: 'iPhone 5', width: 320, height: 568 },
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone X', width: 375, height: 812 },
      { name: 'iPhone XR', width: 414, height: 896 },
      { name: 'iPhone 11', width: 414, height: 896 },
      { name: 'iPhone 11 Pro', width: 375, height: 812 },
      { name: 'iPhone 11 Pro Max', width: 414, height: 896 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'iPhone 12 Mini', width: 360, height: 780 },
      { name: 'iPhone 12 Pro', width: 390, height: 844 },
      { name: 'iPhone 12 Pro Max', width: 428, height: 926 },
      { name: 'iPhone 13', width: 390, height: 844 },
      { name: 'iPhone 13 Mini', width: 360, height: 780 },
      { name: 'iPhone 13 Pro', width: 390, height: 844 },
      { name: 'iPhone 13 Pro Max', width: 428, height: 926 },
      { name: 'iPhone 14', width: 390, height: 844 },
      { name: 'iPhone 14 Plus', width: 428, height: 926 },
      { name: 'iPhone 14 Pro', width: 390, height: 844 },
      { name: 'iPhone 14 Pro Max', width: 428, height: 926 },
      { name: 'iPhone 15', width: 393, height: 852 },
      { name: 'iPhone 15 Pro', width: 393, height: 852 },
      { name: 'iPhone 15 Pro Max', width: 430, height: 932 },
    ],
  },
  {
    category: 'Tablets',
    items: [
      { name: 'iPad Mini 8.3"', width: 744, height: 1133 },
      { name: 'iPad (10.9")', width: 820, height: 1180 },
      { name: 'iPad Air 10.9"', width: 820, height: 1180 },
      { name: 'iPad Pro 11"', width: 834, height: 1194 },
      { name: 'iPad Pro 12.9"', width: 1024, height: 1366 },
      { name: 'Samsung Tab S8', width: 800, height: 1280 },
    ],
  },
  {
    category: 'Laptops',
    items: [
      { name: 'MacBook Air 13"', width: 1280, height: 800 },
      { name: 'MacBook Pro 14"', width: 1512, height: 982 },
      { name: 'MacBook Pro 16"', width: 1728, height: 1117 },
      { name: 'Surface Laptop 3', width: 1280, height: 853 },
      { name: 'Generic Laptop (1366×768)', width: 1366, height: 768 },
    ],
  },
  {
    category: 'Desktops',
    items: [
      { name: '1024×768', width: 1024, height: 768 },
      { name: '1280×800', width: 1280, height: 800 },
      { name: '1440×900', width: 1440, height: 900 },
      { name: '1600×900', width: 1600, height: 900 },
      { name: '1920×1080 (Full HD)', width: 1920, height: 1080 },
      { name: '2560×1440 (QHD)', width: 2560, height: 1440 },
      { name: '3840×2160 (4K UHD)', width: 3840, height: 2160 },
    ],
  },
];

const deviceIcons: Record<string, JSX.Element> = {
  'Android smartphones': <Smartphone className="w-6 h-6 text-primary" />, 
  'Apple smartphones': <Smartphone className="w-6 h-6 text-pink-500" />, 
  'Tablets': <Smartphone className="w-6 h-6 text-orange-500" />, 
  'Laptops': <Smartphone className="w-6 h-6 text-blue-500" />, 
  'Desktops': <Smartphone className="w-6 h-6 text-green-500" />
};

export default function ScreenResponsivenessPage() {
  const [inputUrl, setInputUrl] = useState<string>('https://example.com');
  const [previewUrl, setPreviewUrl] = useState<string>('https://example.com');
  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>(devicePresets[0].items[0]);
  const [iframeLoading, setIframeLoading] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [darkFrame, setDarkFrame] = useState(false);

  const handlePreview = () => {
    let url = inputUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    setPreviewUrl(url);
    setIframeLoading(true);
  };

  const deviceWidth = isRotated ? selectedDevice.height : selectedDevice.width;
  const deviceHeight = isRotated ? selectedDevice.width : selectedDevice.height;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0e7ff] via-[#f0f4ff] to-[#f8fafc] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight drop-shadow-lg">Responsive Preview Tool</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-lg">Enter any public URL, choose a device, and instantly preview how the site looks on different screens.</p>
        </div>

        {/* URL input with floating label and clear button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-3xl mx-auto">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder=" "
              className="peer w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary text-base shadow-lg"
            />
            <label className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none transition-all duration-200 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-primary peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400">
              Website URL
            </label>
            {inputUrl && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                onClick={() => setInputUrl('')}
                aria-label="Clear URL"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>
          <button
            onClick={handlePreview}
            className="px-6 py-3 rounded-xl text-white bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition font-semibold shadow-lg flex items-center gap-2"
          >
            <Smartphone className="w-5 h-5" />
            Preview
          </button>
        </div>

        {/* Device selector: custom modern dropdown */}
        <div className="w-full flex justify-center mb-4 relative z-30">
          <CustomDeviceDropdown
            devicePresets={devicePresets}
            selectedDevice={selectedDevice}
            setSelectedDevice={setSelectedDevice}
            deviceIcons={deviceIcons}
          />
        </div>
        {/* END Device selector: custom modern dropdown */}

        <div className="flex flex-col gap-8 transition-all duration-300">
          {/* Preview with device frame, controls, and animated skeleton loader */}
          <div className="w-full flex-1 flex flex-col items-center gap-4 transition-all duration-300">
            <div className="w-full overflow-x-auto flex justify-center px-2">
              <div className="flex flex-col items-center w-full max-w-full">
                {/* Controls */}
                <div className="flex gap-2 mb-4 justify-center flex-wrap">
                  <button
                    className="p-2 rounded-lg bg-white/70 dark:bg-gray-800/70 shadow border border-gray-200 dark:border-gray-700 hover:bg-primary/10 hover:scale-105 transition"
                    onClick={() => setIsRotated((r) => !r)}
                    title="Rotate device"
                  >
                    <RotateCw className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 rounded-lg bg-white/70 dark:bg-gray-800/70 shadow border border-gray-200 dark:border-gray-700 hover:bg-primary/10 hover:scale-105 transition"
                    onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}
                    title="Zoom out"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 rounded-lg bg-white/70 dark:bg-gray-800/70 shadow border border-gray-200 dark:border-gray-700 hover:bg-primary/10 hover:scale-105 transition"
                    onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
                    title="Zoom in"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  <button
                    className={`p-2 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:scale-105 transition ${darkFrame ? 'bg-gray-900 text-white' : 'bg-white/70 dark:bg-gray-800/70'}`}
                    onClick={() => setDarkFrame((d) => !d)}
                    title="Toggle device frame theme"
                  >
                    {darkFrame ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                </div>
                
                {selectedDevice ? (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedDevice.name + previewUrl + isRotated + zoom + darkFrame}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="w-full flex justify-center"
                    >
                      <div 
                        className={`relative rounded-[2.5rem] border-8 ${darkFrame ? 'border-gray-900 bg-gray-900' : 'border-gray-200 bg-white'} shadow-2xl transition-all duration-300`}
                        style={{ 
                          width: `min(${deviceWidth * zoom + 32}px, 95vw)`,
                          height: `min(${deviceHeight * zoom + 32}px, 80vh)`,
                          aspectRatio: `${deviceWidth + 32} / ${deviceHeight + 32}`
                        }}
                      >
                        {/* Device notch */}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-2 rounded-full bg-gray-300/60 dark:bg-gray-700/60 z-20" />
                        
                        {/* Loading overlay */}
                        {iframeLoading && (
                          <div className="absolute inset-2 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10 rounded-[2rem]">
                            <Loader2 className="w-10 h-10 animate-spin text-primary mb-2" />
                            <span className="text-gray-500 dark:text-gray-300 text-sm">Loading preview...</span>
                          </div>
                        )}
                        
                        {/* Iframe container */}
                        <div 
                          className="absolute inset-2 rounded-[2rem] overflow-hidden"
                          style={{ 
                            width: `calc(100% - 16px)`,
                            height: `calc(100% - 16px)`
                          }}
                        >
                          <iframe
                            src={previewUrl}
                            title="website preview"
                            className="w-full h-full border-0 rounded-[2rem]"
                            style={{ 
                              background: darkFrame ? '#18181b' : '#fff',
                              transform: `scale(${Math.min(1, (deviceWidth * zoom) / deviceWidth, (deviceHeight * zoom) / deviceHeight)})`,
                              transformOrigin: 'top left',
                              width: `${deviceWidth}px`,
                              height: `${deviceHeight}px`
                            }}
                            onLoad={() => setIframeLoading(false)}
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 w-full max-w-md mx-auto bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-inner border border-dashed border-gray-300 dark:border-gray-700">
                    <span className="text-2xl text-gray-400 dark:text-gray-600 mb-2">📱</span>
                    <span className="text-gray-500 dark:text-gray-400 text-center px-4">Select a device to preview the site</span>
                  </div>
                )}
                
                {/* Device info */}
                <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400 mt-4 justify-center flex-wrap">
                  <span>Device: <b>{selectedDevice?.name || '-'}</b></span>
                  <span>Size: <b>{selectedDevice ? `${deviceWidth}×${deviceHeight}` : '-'}</b></span>
                  <span>Zoom: <b>{Math.round(zoom * 100)}%</b></span>
                  <span>Theme: <b>{darkFrame ? 'Dark' : 'Light'}</b></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 max-w-4xl mx-auto mt-6">
          Some websites may block being embedded in an iframe due to security policies (X-Frame-Options / Content-Security-Policy). If the preview remains blank, the target site likely prevents embedding.
        </p>
      </div>
    </div>
  );
} 

type DeviceSection = {
  category: string;
  items: DevicePreset[];
};

type CustomDeviceDropdownProps = {
  devicePresets: DeviceSection[];
  selectedDevice: DevicePreset;
  setSelectedDevice: (device: DevicePreset) => void;
  deviceIcons: Record<string, JSX.Element>;
};

function CustomDeviceDropdown({ devicePresets, selectedDevice, setSelectedDevice, deviceIcons }: CustomDeviceDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (buttonRef.current && !(buttonRef.current as Node).contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
    } else {
      document.removeEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative w-full max-w-xs">
      <button
        ref={buttonRef}
        className={`w-full px-4 py-3 rounded-xl border-2 border-primary/40 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md shadow-lg text-base flex items-center justify-between gap-2 font-semibold focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 ${open ? 'ring-2 ring-primary' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        type="button"
      >
        <span className="truncate flex items-center gap-2">
          {selectedDevice && (
            <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2" />
          )}
          {selectedDevice?.name} ({selectedDevice?.width}×{selectedDevice?.height})
        </span>
        <svg className={`w-5 h-5 ml-2 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-full max-h-80 overflow-y-auto rounded-2xl shadow-2xl border border-primary/20 bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl z-50 animate-fade-in flex flex-col">
          {devicePresets.map((section) => (
            <div key={section.category} className="px-3 py-2">
              <div className="flex items-center gap-2 text-xs font-bold text-primary/80 uppercase tracking-wide mb-1">
                {deviceIcons[section.category]}
                {section.category}
              </div>
              {section.items.map((device) => {
                const active = selectedDevice.name === device.name;
                return (
                  <button
                    key={device.name}
                    className={`w-full text-left px-4 py-2 rounded-lg flex items-center justify-between gap-2 mb-1 transition-all duration-150 ${active ? 'bg-primary/10 text-primary font-bold ring-2 ring-primary/30' : 'hover:bg-primary/5 text-gray-800 dark:text-gray-200'}`}
                    onClick={() => {
                      setSelectedDevice(device);
                      setOpen(false);
                    }}
                    type="button"
                  >
                    <span className="truncate">{device.name} <span className="text-xs text-gray-400">({device.width}×{device.height})</span></span>
                    {active && <span className="ml-2 text-primary">✓</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 