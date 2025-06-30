'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MonitorSmartphone, Smartphone, Tablet, Laptop, Monitor, XCircle, Loader2 } from 'lucide-react';

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
  'Tablets': <Tablet className="w-6 h-6 text-orange-500" />, 
  'Laptops': <Laptop className="w-6 h-6 text-blue-500" />, 
  'Desktops': <Monitor className="w-6 h-6 text-green-500" />
};

export default function ScreenResponsivenessPage() {
  const [inputUrl, setInputUrl] = useState<string>('https://example.com');
  const [previewUrl, setPreviewUrl] = useState<string>('https://example.com');
  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>(devicePresets[0].items[0]);
  const [iframeLoading, setIframeLoading] = useState(false);

  const handlePreview = () => {
    let url = inputUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    setPreviewUrl(url);
    setIframeLoading(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
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
              className="peer w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary text-base shadow-sm"
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
            className="px-6 py-3 rounded-lg text-white bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition font-semibold shadow-md flex items-center gap-2"
          >
            <MonitorSmartphone className="w-5 h-5" />
            Preview
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Device list with icons and animation */}
          <div className="lg:w-2/5 space-y-8 max-h-[70vh] overflow-y-auto pr-2">
            {devicePresets.map((section) => (
              <div key={section.category}>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  {deviceIcons[section.category]}
                  {section.category}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {section.items.map((device) => {
                    const active = selectedDevice.name === device.name;
                    return (
                      <motion.button
                        key={device.name}
                        onClick={() => setSelectedDevice(device)}
                        className={`group relative p-4 flex flex-col items-center rounded-xl border ${active ? 'border-primary shadow-lg scale-105 bg-gradient-to-br from-primary/10 to-secondary/10' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-800 hover:shadow-md transition-all duration-200`}
                        whileTap={{ scale: 0.97 }}
                        whileHover={{ scale: 1.04 }}
                      >
                        <span className="w-6 h-10 mb-2 bg-gray-200 dark:bg-gray-600 rounded-sm group-hover:bg-primary group-hover:opacity-80 transition"></span>
                        <span className="text-xs text-center text-gray-700 dark:text-gray-300 leading-tight font-medium">
                          {device.name}
                        </span>
                        {active && (
                          <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] rounded-full px-2 py-0.5 shadow">✓</span>
                        )}
                        <span className="absolute bottom-2 right-2 text-xs text-gray-400">{device.width}×{device.height}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Preview with animated skeleton loader */}
          <div className="flex-1 flex justify-center items-start lg:items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDevice.name + previewUrl}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl overflow-hidden shadow-2xl bg-white border border-gray-200 dark:border-gray-700 relative"
                style={{ width: selectedDevice.width, height: selectedDevice.height }}
              >
                {iframeLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mb-2" />
                    <span className="text-gray-500 dark:text-gray-300 text-sm">Loading preview...</span>
                  </div>
                )}
                <iframe
                  src={previewUrl}
                  title="website preview"
                  style={{ width: selectedDevice.width, height: selectedDevice.height }}
                  className="border-0"
                  onLoad={() => setIframeLoading(false)}
                />
              </motion.div>
            </AnimatePresence>
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