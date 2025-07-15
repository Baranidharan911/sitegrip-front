'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  MapPin, 
  ZoomIn, 
  ZoomOut, 
  Navigation, 
  Layers, 
  Filter, 
  Download, 
  Share2, 
  Info,
  Target,
  Building2,
  Star,
  Users,
  Phone,
  Globe,
  Maximize2,
  Minimize2,
  RotateCcw,
  Settings,
  Eye,
  EyeOff,
  Grid,
  X
} from 'lucide-react';

interface MapViewProps {
  gridSize: number;
  distance: number;
  distanceUnit: string;
  coordinates: { lat: number; lng: number };
  searchResults: any[];
  onLocationClick?: (location: any) => void;
}

interface GridCell {
  x: number;
  y: number;
  rank: number;
  color: string;
  hasBusiness: boolean;
  business?: any;
  isHovered: boolean;
}

export default function EnhancedMapView({
  gridSize,
  distance,
  distanceUnit,
  coordinates,
  searchResults,
  onLocationClick
}: MapViewProps) {
  const [zoom, setZoom] = useState(1);
  const [showLegend, setShowLegend] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [selectedCell, setSelectedCell] = useState<GridCell | null>(null);
  const [hoveredCell, setHoveredCell] = useState<GridCell | null>(null);
  const [mapMode, setMapMode] = useState<'grid' | 'satellite' | 'terrain'>('grid');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Generate grid data
  const generateGrid = (): GridCell[] => {
    const grid: GridCell[] = [];
    
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        // Find if there's a business at this position
        const businessAtPosition = searchResults.find(result => 
          result.gridPosition?.x === x && result.gridPosition?.y === y
        );
        
        let rank = 0;
        let color = '#6b7280'; // gray for empty cells
        
        if (businessAtPosition) {
          rank = businessAtPosition.rank || 0;
          if (rank <= 3) color = '#10b981'; // green
          else if (rank <= 6) color = '#f59e0b'; // yellow
          else color = '#ef4444'; // red
        }
        
        grid.push({
          x,
          y,
          rank,
          color,
          hasBusiness: !!businessAtPosition,
          business: businessAtPosition || null,
          isHovered: false
        });
      }
    }
    
    return grid;
  };

  const grid = generateGrid();

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setSelectedCell(null);
  };

  const handleCellClick = (cell: GridCell) => {
    setSelectedCell(cell);
    if (onLocationClick && cell.business) {
      onLocationClick(cell.business);
    }
  };

  const handleCellHover = (cell: GridCell, isHovered: boolean) => {
    setHoveredCell(isHovered ? cell : null);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const cellSize = 40 * zoom;
  const gridWidth = gridSize * cellSize;
  const gridHeight = gridSize * cellSize;

  return (
    <div className="relative bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
      {/* Map Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Local Search Grid Map</h3>
              <p className="text-blue-100 text-sm">
                {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Toggle Legend"
            >
              {showLegend ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef}
        className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50"
        style={{ height: '500px' }}
      >
        {/* Empty State */}
        {searchResults.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Search Results</h3>
              <p className="text-gray-600 mb-4">Run a scan to see local search rankings on the grid map</p>
              <div className="text-sm text-gray-500">
                <p>• Configure your search parameters</p>
                <p>• Click "Run Scan" to analyze local rankings</p>
                <p>• View results on the interactive grid map</p>
              </div>
            </div>
          </div>
        )}

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 2px, transparent 2px)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Grid Container */}
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            width: gridWidth,
            height: gridHeight,
            transform: `translate(-50%, -50%) scale(${zoom})`
          }}
        >
          {/* Grid Lines */}
          {showGrid && (
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox={`0 0 ${gridWidth} ${gridHeight}`}
            >
              {/* Vertical lines */}
              {Array.from({ length: gridSize + 1 }, (_, i) => (
                <line
                  key={`v-${i}`}
                  x1={i * cellSize}
                  y1="0"
                  x2={i * cellSize}
                  y2={gridHeight}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  opacity="0.6"
                />
              ))}
              {/* Horizontal lines */}
              {Array.from({ length: gridSize + 1 }, (_, i) => (
                <line
                  key={`h-${i}`}
                  x1="0"
                  y1={i * cellSize}
                  x2={gridWidth}
                  y2={i * cellSize}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  opacity="0.6"
                />
              ))}
            </svg>
          )}

          {/* Grid Cells */}
          <div className="relative w-full h-full">
            {grid.map((cell) => (
              <div
                key={`${cell.x}-${cell.y}`}
                className={`absolute cursor-pointer transition-all duration-200 ${
                  cell.hasBusiness ? 'hover:scale-110' : ''
                } ${selectedCell === cell ? 'ring-4 ring-blue-500 ring-opacity-50' : ''}`}
                style={{
                  left: cell.x * cellSize,
                  top: cell.y * cellSize,
                  width: cellSize,
                  height: cellSize
                }}
                onClick={() => handleCellClick(cell)}
                onMouseEnter={() => handleCellHover(cell, true)}
                onMouseLeave={() => handleCellHover(cell, false)}
              >
                {cell.hasBusiness ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Business Marker */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-white"
                      style={{ backgroundColor: cell.color }}
                    >
                      {cell.rank}
                    </div>
                    
                    {/* Hover Effect */}
                    {hoveredCell === cell && (
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap z-10">
                        <div className="font-semibold">{cell.business?.name || `Rank ${cell.rank}`}</div>
                        <div className="text-gray-300">{cell.business?.address || 'Location'}</div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-300 rounded-full opacity-50"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Center Marker */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6">
            <div className="w-full h-full bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <Target className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleReset}
            className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Map Mode Toggle */}
        <div className="absolute top-4 left-4">
          <div className="bg-white rounded-lg shadow-lg p-1">
            <div className="flex">
              {(['grid', 'satellite', 'terrain'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setMapMode(mode)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    mapMode === mode 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid Info */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
          <div className="text-sm text-gray-600">
            <div className="flex items-center gap-2 mb-1">
              <Grid className="w-4 h-4" />
              <span className="font-medium">{gridSize} × {gridSize} Grid</span>
            </div>
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              <span>{distance} {distanceUnit}</span>
            </div>
          </div>
        </div>

        {/* Zoom Level Indicator */}
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg px-3 py-2">
          <div className="text-sm font-medium text-gray-600">
            {Math.round(zoom * 100)}%
          </div>
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="bg-gray-50 border-t border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Map Legend</h4>
            <div className="flex items-center gap-2">
              <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                <Download className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                <Share2 className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full shadow-sm"></div>
              <span className="text-sm text-gray-700">Rank 1-3 (Top)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-sm"></div>
              <span className="text-sm text-gray-700">Rank 4-6 (Good)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full shadow-sm"></div>
              <span className="text-sm text-gray-700">Rank 7+ (Needs Work)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full shadow-sm border-2 border-white"></div>
              <span className="text-sm text-gray-700">Your Business</span>
            </div>
          </div>
        </div>
      )}

      {/* Selected Location Details */}
      {selectedCell && selectedCell.business && (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm"
                style={{ backgroundColor: selectedCell.color }}
              >
                {selectedCell.rank}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{selectedCell.business.name}</h4>
                <p className="text-sm text-gray-600">{selectedCell.business.address}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{selectedCell.business.rating}</span>
                    <span className="text-sm text-gray-500">({selectedCell.business.reviews?.toLocaleString()} reviews)</span>
                  </div>
                  {selectedCell.business.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{selectedCell.business.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedCell(null)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 