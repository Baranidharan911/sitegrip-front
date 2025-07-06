'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenTool, Type, Square, Circle, ArrowRight, Highlighter, Trash2, Save, Download, RotateCcw, Image, Layers, Palette } from 'lucide-react';

interface Annotation {
  id: string;
  type: 'text' | 'rectangle' | 'circle' | 'arrow' | 'highlight';
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
  fontSize?: number;
  rotation?: number;
}

interface ChartData {
  id: string;
  name: string;
  data: number[];
  labels: string[];
}

export default function ChartAnnotationsPage() {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedTool, setSelectedTool] = useState<'text' | 'rectangle' | 'circle' | 'arrow' | 'highlight'>('text');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [selectedFontSize, setSelectedFontSize] = useState(16);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const canvasRef = useRef<HTMLDivElement>(null);
  const [chartData, setChartData] = useState<ChartData>({
    id: 'sample-chart',
    name: 'Monthly Traffic Analytics',
    data: [1200, 1900, 3000, 5000, 2000, 3000, 4500, 3800, 5200, 4800, 6000, 5500],
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  const addAnnotation = (type: Annotation['type'], x: number, y: number, width = 100, height = 50) => {
    const newAnnotation: Annotation = {
      id: `annotation-${Date.now()}`,
      type,
      x,
      y,
      width,
      height,
      text: type === 'text' ? 'Double click to edit' : undefined,
      color: selectedColor,
      fontSize: selectedFontSize,
      rotation: 0
    };
    setAnnotations(prev => [...prev, newAnnotation]);
  };

  const updateAnnotation = (id: string, updates: Partial<Annotation>) => {
    setAnnotations(prev => prev.map(ann => 
      ann.id === id ? { ...ann, ...updates } : ann
    ));
  };

  const deleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
    setSelectedAnnotation(null);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedTool === 'text') {
      addAnnotation('text', x, y);
    } else if (selectedTool === 'highlight') {
      addAnnotation('highlight', x, y, 200, 30);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current || selectedTool === 'text' || selectedTool === 'highlight') return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setStartPoint({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const width = Math.abs(x - startPoint.x);
    const height = Math.abs(y - startPoint.y);
    
    // Update the last annotation (the one being drawn)
    if (annotations.length > 0) {
      const lastAnnotation = annotations[annotations.length - 1];
      if (lastAnnotation.type === selectedTool) {
        updateAnnotation(lastAnnotation.id, {
          x: Math.min(x, startPoint.x),
          y: Math.min(y, startPoint.y),
          width,
          height
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    if (selectedTool === 'rectangle') {
      addAnnotation('rectangle', startPoint.x, startPoint.y, 100, 50);
    } else if (selectedTool === 'circle') {
      addAnnotation('circle', startPoint.x, startPoint.y, 80, 80);
    } else if (selectedTool === 'arrow') {
      addAnnotation('arrow', startPoint.x, startPoint.y, 100, 20);
    }
  };

  const handleTextEdit = (id: string) => {
    const annotation = annotations.find(ann => ann.id === id);
    if (annotation && annotation.text) {
      setEditingText(annotation.text);
      setSelectedAnnotation(id);
    }
  };

  const saveTextEdit = () => {
    if (selectedAnnotation) {
      updateAnnotation(selectedAnnotation, { text: editingText });
      setSelectedAnnotation(null);
      setEditingText('');
    }
  };

  const exportAnnotations = () => {
    const data = {
      chartData: chartData,
      annotations,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chart-annotations.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setAnnotations([]);
    setSelectedAnnotation(null);
  };

  const renderAnnotation = (annotation: Annotation) => {
    const isSelected = selectedAnnotation === annotation.id;
    const baseClasses = `absolute cursor-pointer transition-all ${
      isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
    }`;

    switch (annotation.type) {
      case 'text':
        return (
          <div
            key={annotation.id}
            className={`${baseClasses} ${isSelected ? 'z-50' : 'z-10'}`}
            style={{
              left: annotation.x,
              top: annotation.y,
              color: annotation.color,
              fontSize: annotation.fontSize
            }}
            onClick={() => setSelectedAnnotation(annotation.id)}
            onDoubleClick={() => handleTextEdit(annotation.id)}
          >
            {isSelected && selectedAnnotation === annotation.id ? (
              <input
                type="text"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onBlur={saveTextEdit}
                onKeyPress={(e) => e.key === 'Enter' && saveTextEdit()}
                className="bg-transparent border-none outline-none"
                style={{ color: annotation.color, fontSize: annotation.fontSize }}
                autoFocus
              />
            ) : (
              <span>{annotation.text}</span>
            )}
          </div>
        );

      case 'rectangle':
        return (
          <div
            key={annotation.id}
            className={`${baseClasses} border-2`}
            style={{
              left: annotation.x,
              top: annotation.y,
              width: annotation.width,
              height: annotation.height,
              borderColor: annotation.color,
              backgroundColor: `${annotation.color}20`
            }}
            onClick={() => setSelectedAnnotation(annotation.id)}
          />
        );

      case 'circle':
        return (
          <div
            key={annotation.id}
            className={`${baseClasses} border-2 rounded-full`}
            style={{
              left: annotation.x,
              top: annotation.y,
              width: annotation.width,
              height: annotation.height,
              borderColor: annotation.color,
              backgroundColor: `${annotation.color}20`
            }}
            onClick={() => setSelectedAnnotation(annotation.id)}
          />
        );

      case 'arrow':
        return (
          <div
            key={annotation.id}
            className={`${baseClasses} flex items-center`}
            style={{
              left: annotation.x,
              top: annotation.y,
              width: annotation.width,
              height: annotation.height
            }}
            onClick={() => setSelectedAnnotation(annotation.id)}
          >
            <ArrowRight size={annotation.height} style={{ color: annotation.color }} />
          </div>
        );

      case 'highlight':
        return (
          <div
            key={annotation.id}
            className={`${baseClasses} rounded`}
            style={{
              left: annotation.x,
              top: annotation.y,
              width: annotation.width,
              height: annotation.height,
              backgroundColor: `${annotation.color}40`
            }}
            onClick={() => setSelectedAnnotation(annotation.id)}
          />
        );

      default:
        return null;
    }
  };

  // Simulate real-time chart data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prev => ({
        ...prev,
        data: prev.data.map(val => Math.max(1000, Math.round(val + (Math.random() - 0.5) * 1000)))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setChartData(prev => ({
      ...prev,
      data: prev.data.map(() => 1000 + Math.floor(Math.random() * 6000))
    }));
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0e7ff] via-[#f0f4ff] to-[#f8fafc] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <PenTool className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg">
              Chart Annotations
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Annotate and interact with live-updating analytics charts in real time
          </p>
        </motion.div>

        <div className="flex justify-end mb-4">
          <button onClick={handleRefresh} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-xl text-base">
            <RotateCcw size={20} /> Refresh Data
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Tools Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Drawing Tools */}
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Layers className="text-purple-500" size={20} />
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Tools</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { tool: 'text', icon: Type, label: 'Text' },
                  { tool: 'rectangle', icon: Square, label: 'Rectangle' },
                  { tool: 'circle', icon: Circle, label: 'Circle' },
                  { tool: 'arrow', icon: ArrowRight, label: 'Arrow' },
                  { tool: 'highlight', icon: Highlighter, label: 'Highlight' }
                ].map(({ tool, icon: Icon, label }) => (
                  <button
                    key={tool}
                    onClick={() => setSelectedTool(tool as any)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      selectedTool === tool
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                    }`}
                  >
                    <Icon className={`mx-auto mb-1 ${selectedTool === tool ? 'text-purple-500' : 'text-gray-400'}`} size={20} />
                    <span className={`text-xs font-medium ${selectedTool === tool ? 'text-purple-600' : 'text-gray-600 dark:text-gray-400'}`}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Palette */}
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Palette className="text-purple-500" size={20} />
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Colors</h3>
              </div>
              
              <div className="grid grid-cols-5 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      selectedColor === color ? 'border-gray-800 dark:border-white scale-110' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Text Settings */}
            {selectedTool === 'text' && (
              <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Text Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Font Size
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="48"
                      value={selectedFontSize}
                      onChange={(e) => setSelectedFontSize(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {selectedFontSize}px
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={exportAnnotations}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all"
                >
                  <Download size={16} />
                  Export
                </button>
                <button
                  onClick={clearAll}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all"
                >
                  <Trash2 size={16} />
                  Clear All
                </button>
              </div>
            </div>
          </motion.div>

          {/* Chart Canvas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {chartData.name}
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {annotations.length} annotations
                </div>
              </div>

              {/* Chart Area */}
              <div
                ref={canvasRef}
                className="relative w-full h-96 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-crosshair"
                onClick={handleCanvasClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                {/* Sample Chart Visualization */}
                <div className="absolute inset-4 flex items-end justify-between">
                  {chartData.data.map((value, index) => {
                    const height = (value / Math.max(...chartData.data)) * 100;
                    return (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className="w-8 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                          {chartData.labels[index]}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Annotations */}
                {annotations.map(renderAnnotation)}

                {/* Instructions */}
                {annotations.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <PenTool size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Click to add annotations</p>
                      <p className="text-sm">Select a tool from the left panel to get started</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Selected Annotation Controls */}
              {selectedAnnotation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                      Selected Annotation
                    </span>
                    <button
                      onClick={() => deleteAnnotation(selectedAnnotation)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 