import React, { useState, useRef, useEffect } from 'react';
import { Eye, Plus, Check, RotateCw, RefreshCw, Move, Box, Camera, Sparkles } from 'lucide-react';

import frame0 from '../assets/engine_frame_0.png';
import frame1 from '../assets/engine_frame_1.png';
import frame2 from '../assets/engine_frame_2.png';
import frame3 from '../assets/engine_frame_3.png';
import frame4 from '../assets/engine_frame_4.png';
import frame5 from '../assets/engine_frame_5.png';

const ENGINE_FRAMES = [
  { img: frame0, angle: 0, label: '0° FRONT VIEW' },
  { img: frame1, angle: 60, label: '60° FRONT-LEFT' },
  { img: frame2, angle: 120, label: '120° REAR-LEFT' },
  { img: frame3, angle: 180, label: '180° REAR VIEW' },
  { img: frame4, angle: 240, label: '240° REAR-RIGHT' },
  { img: frame5, angle: 300, label: '300° FRONT-RIGHT' }
];

const BLUEPRINT_HOTSPOTS = [
  {
    id: 'carb-01',
    name: 'NOS Holley 4150 Carburetor',
    partNumber: 'PART // C7ZX-9510-A',
    price: 849.00,
    baseX: 49,
    baseY: 20,
    position3D: '0m 0.8m 0m',
    normal3D: '0m 1m 0m',
    category: 'Fuel & Carburetion',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
    description: 'Original high-performance 4-barrel carburetor for classic flat-four & V8 engine platforms.'
  },
  {
    id: 'head-02',
    name: 'Dual-Port Aluminum Cylinder Head Set',
    partNumber: 'PART // VW-113-101-065',
    price: 425.00,
    baseX: 66,
    baseY: 44,
    position3D: '0.4m 0.3m 0.1m',
    normal3D: '1m 0m 0m',
    category: 'Engine Block & Internals',
    image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=600&q=80',
    description: 'High-density aluminum alloy dual-port cylinder head set with hardened valve seats.'
  },
  {
    id: 'piston-03',
    name: 'Mahle Forged Piston & Cylinder Kit',
    partNumber: 'PART // MAHLE-85.5MM',
    price: 620.00,
    baseX: 38,
    baseY: 68,
    position3D: '-0.3m -0.2m 0m',
    normal3D: '-1m 0m 0m',
    category: 'Engine Block & Internals',
    image: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80',
    description: 'Forged aluminum pistons with cast iron cylinders, wrist pins, and stainless rings.'
  }
];

export default function EngineBlueprintInspector({ onAddToCart, onViewPartDetails }) {
  const [selectedHotspot, setSelectedHotspot] = useState(BLUEPRINT_HOTSPOTS[0]);
  const [addedIds, setAddedIds] = useState([]);
  const [viewMode, setViewMode] = useState('3d_canvas'); // '3d_canvas' or 'turntable'

  // 360 Degree Rotation States for Turntable Mode
  const [rotationY, setRotationY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0 });
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);

  const containerRef = useRef(null);
  const modelViewerRef = useRef(null);

  // Load Google 3D model-viewer on-demand only when this inspector mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && !customElements.get('model-viewer')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
      document.head.appendChild(script);
    }
  }, []);

  // Auto-Spin 360 Animation Loop
  useEffect(() => {
    let interval;
    if (isAutoSpinning && viewMode === 'turntable') {
      interval = setInterval(() => {
        setRotationY((prev) => (prev + 2) % 360);
      }, 40);
    }
    return () => clearInterval(interval);
  }, [isAutoSpinning, viewMode]);

  // Mouse / Touch Drag Handlers
  const handleMouseDown = (e) => {
    if (viewMode !== 'turntable') return;
    setIsDragging(true);
    setIsAutoSpinning(false);
    setDragStart({ x: e.clientX });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || viewMode !== 'turntable') return;
    const deltaX = e.clientX - dragStart.x;
    setRotationY((prev) => (prev + deltaX * 0.8) % 360);
    setDragStart({ x: e.clientX });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleAdd = (item) => {
    onAddToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      partNumber: item.partNumber,
      image: item.image,
      category: item.category
    });
    setAddedIds((prev) => [...prev, item.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== item.id));
    }, 2000);
  };

  // Normalized 0 to 360 Angle
  const normalizedAngle = ((Math.round(rotationY) % 360) + 360) % 360;
  const frameIndex = Math.floor(normalizedAngle / 60) % 6;
  const currentFrame = ENGINE_FRAMES[frameIndex];

  const getHotspotStyle = (hotspot) => {
    const rad = (rotationY * Math.PI) / 180;
    const offsetX = Math.sin(rad) * 16;
    const left = `calc(${hotspot.baseX}% + ${offsetX}px)`;
    const top = `${hotspot.baseY}%`;

    return { left, top };
  };

  return (
    <section id="blueprint" className="max-w-[1440px] mx-auto px-4 md:px-8 mb-32 pt-8">
      
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#83cffb]/10 border border-[#83cffb]/30 text-[#83cffb] font-technical-data text-xs uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5" /> REAL-TIME 3D WEBGL ENGINE INSPECTOR
        </div>
        <h2 className="font-h2 text-2xl md:text-4xl text-[#e5e2e3] font-bold mb-3">
          Inspect the Engine. Rotate in True 3D.
        </h2>
        <p className="font-body-md text-sm md:text-base text-[#e0c0b1] max-w-xl mx-auto">
          Full 3D WebGL orbit controls with PBR reflections, real lighting, and 360° turntable inspection.
        </p>
      </div>

      {/* Main Inspector Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[620px]">
        
        {/* Interactive 3D Canvas View (Left Column) */}
        <div className="lg:col-span-2 glass-panel relative overflow-hidden flex flex-col justify-between group rounded-none select-none min-h-[540px]">
          
          {/* Top Mode Selector Bar */}
          <div className="relative z-20 flex flex-wrap items-center justify-between p-4 border-b border-[#584236]/30 bg-[#131314]/90 backdrop-blur-md gap-3">
            <div className="flex items-center gap-2 font-technical-data text-xs">
              <button
                onClick={() => setViewMode('3d_canvas')}
                className={`px-3 py-1.5 flex items-center gap-1.5 transition-all ${
                  viewMode === '3d_canvas'
                    ? 'bg-[#ff7a1a] text-black font-bold glow-button'
                    : 'bg-[#201f20] text-[#e0c0b1] hover:text-[#ff7a1a]'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>3D WebGL Canvas</span>
              </button>

              <button
                onClick={() => setViewMode('turntable')}
                className={`px-3 py-1.5 flex items-center gap-1.5 transition-all ${
                  viewMode === 'turntable'
                    ? 'bg-[#ff7a1a] text-black font-bold glow-button'
                    : 'bg-[#201f20] text-[#e0c0b1] hover:text-[#ff7a1a]'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>6-Angle Turntable</span>
              </button>
            </div>

            {viewMode === 'turntable' && (
              <div className="flex items-center gap-2 font-technical-data text-xs">
                {ENGINE_FRAMES.map((f, idx) => (
                  <button 
                    key={f.angle}
                    onClick={() => { setRotationY(f.angle); setIsAutoSpinning(false); }}
                    className={`px-2 py-1 transition-all ${frameIndex === idx ? 'bg-[#ff7a1a] text-black font-bold' : 'bg-[#201f20] text-[#e0c0b1] hover:text-[#ff7a1a]'}`}
                  >
                    {f.angle}°
                  </button>
                ))}
                <button 
                  onClick={() => setIsAutoSpinning(!isAutoSpinning)}
                  className={`px-3 py-1 flex items-center gap-1 transition-all ${isAutoSpinning ? 'bg-[#83cffb] text-black font-bold' : 'bg-[#201f20] text-[#83cffb] border border-[#83cffb]/40'}`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAutoSpinning ? 'animate-spin' : ''}`} />
                  <span>{isAutoSpinning ? 'Spinning' : '360°'}</span>
                </button>
              </div>
            )}

            {viewMode === '3d_canvas' && (
              <span className="font-technical-data text-xs text-[#83cffb] uppercase">
                WEBGL PBR LIGHTING // ACTIVE
              </span>
            )}
          </div>

          {/* Viewport Render Area */}
          <div className="relative flex-1 flex items-center justify-center overflow-hidden min-h-[440px]">
            {/* Blueprint Grid Background */}
            <div className="absolute inset-0 bg-blueprint-grid opacity-30 pointer-events-none"></div>

            {/* Hint Tooltip */}
            <div className="absolute top-4 right-4 font-technical-data text-[11px] text-[#a78b7d] bg-[#131314]/80 px-3 py-1.5 border border-[#584236]/40 pointer-events-none flex items-center gap-1.5 z-20">
              <Move className="w-3.5 h-3.5 text-[#ff7a1a]" />
              <span>{viewMode === '3d_canvas' ? 'Orbit 3D Model with Mouse / Pinch to Zoom' : 'Drag to Rotate 360°'}</span>
            </div>

            {/* Mode 1: True 3D WebGL Model Viewer with Orbit Controls */}
            {viewMode === '3d_canvas' ? (
              <div className="w-full h-full min-h-[440px] flex items-center justify-center relative">
                <model-viewer
                  ref={modelViewerRef}
                  src="https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Engine/glTF-Binary/Engine.glb"
                  alt="3D Interactive Engine Model"
                  camera-controls
                  auto-rotate
                  shadow-intensity="1.5"
                  shadow-softness="0.8"
                  environment-image="neutral"
                  exposure="1.2"
                  camera-orbit="0deg 75deg 105%"
                  ar
                  ar-modes="webxr scene-viewer quick-look"
                  className="w-full h-[460px] bg-transparent"
                  style={{ width: '100%', height: '460px', backgroundColor: 'transparent' }}
                >
                  {/* 3D Hotspot Slots attached to GLTF Mesh Coordinates */}
                  {BLUEPRINT_HOTSPOTS.map((hotspot) => {
                    const isSelected = selectedHotspot?.id === hotspot.id;
                    return (
                      <button
                        key={hotspot.id}
                        slot={`hotspot-${hotspot.id}`}
                        data-position={hotspot.position3D}
                        data-normal={hotspot.normal3D}
                        onClick={() => setSelectedHotspot(hotspot)}
                        className="group/pin transform -translate-x-1/2 -translate-y-1/2 focus:outline-none"
                      >
                        <span className={`block w-5 h-5 rounded-full border-2 ${
                          isSelected ? 'border-[#ff7a1a] bg-[#ff7a1a]/50 scale-125' : 'border-[#83cffb] bg-[#83cffb]/30'
                        } animate-pulse`} />
                      </button>
                    );
                  })}
                </model-viewer>
              </div>
            ) : (
              /* Mode 2: 6-Frame Turntable Photo View */
              <div 
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
                className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
              >
                <div 
                  className="w-full h-full max-w-[560px] max-h-[560px] bg-contain bg-center bg-no-repeat opacity-95 mix-blend-screen transition-all duration-200"
                  style={{ 
                    backgroundImage: `url(${currentFrame.img})`
                  }}
                />

                {/* Hotspots for Turntable */}
                {BLUEPRINT_HOTSPOTS.map((hotspot) => {
                  const isSelected = selectedHotspot?.id === hotspot.id;
                  const posStyle = getHotspotStyle(hotspot);
                  return (
                    <button
                      key={hotspot.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedHotspot(hotspot);
                      }}
                      style={{
                        top: posStyle.top,
                        left: posStyle.left
                      }}
                      className={`absolute z-30 transform -translate-x-1/2 -translate-y-1/2 group/pin transition-all duration-300 ${
                        isSelected ? 'scale-125' : 'hover:scale-110'
                      }`}
                    >
                      <span className={`block w-5 h-5 rounded-full border-2 ${
                        isSelected ? 'border-[#ff7a1a] bg-[#ff7a1a]/40' : 'border-[#83cffb] bg-[#83cffb]/20'
                      } animate-pulse`} />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Active Hotspot Description Card */}
            {selectedHotspot && (
              <div className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-md bg-[#131314]/95 border border-[#ff7a1a]/40 p-4 z-30 backdrop-blur-md">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-technical-data text-[10px] text-[#ff7a1a] uppercase font-bold">
                    HOTSPOT ACTIVE // {selectedHotspot.category}
                  </span>
                  <span className="font-technical-data text-xs text-[#ff7a1a] font-bold">
                    ${selectedHotspot.price.toFixed(2)}
                  </span>
                </div>
                <h3 className="font-h3 text-base text-[#e5e2e3] font-bold">
                  {selectedHotspot.name}
                </h3>
                <p className="text-xs text-[#e0c0b1] mt-1 font-technical-data">
                  {selectedHotspot.partNumber}
                </p>
              </div>
            )}
          </div>

          {/* Bottom Control Bar */}
          {viewMode === 'turntable' && (
            <div className="p-4 border-t border-[#584236]/30 bg-[#131314]/90 flex items-center gap-4">
              <span className="font-technical-data text-xs text-[#a78b7d] whitespace-nowrap">
                TURNTABLE ANGLE:
              </span>
              <input 
                type="range"
                min="0"
                max="359"
                value={normalizedAngle}
                onChange={(e) => {
                  setIsAutoSpinning(false);
                  setRotationY(parseFloat(e.target.value));
                }}
                className="w-full accent-[#ff7a1a] cursor-pointer"
              />
              <span className="font-technical-data text-xs text-[#ff7a1a] font-bold w-12 text-right">
                {normalizedAngle}°
              </span>
            </div>
          )}

        </div>

        {/* Detail Inventory Panel (Right Column) */}
        <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar h-[600px]">
          {BLUEPRINT_HOTSPOTS.map((part) => {
            const isSelected = selectedHotspot?.id === part.id;
            const isAdded = addedIds.includes(part.id);
            return (
              <div 
                key={part.id}
                onClick={() => setSelectedHotspot(part)}
                className={`glass-panel p-4 flex flex-col gap-3 cursor-pointer transition-all ${
                  isSelected ? 'border-[#ff7a1a] bg-[#201f20]' : 'hover:border-[#584236]'
                }`}
              >
                <div className="aspect-square bg-[#353436] overflow-hidden relative group/img">
                  <img 
                    src={part.image} 
                    alt={part.name} 
                    className="w-full h-full object-cover opacity-80 group-hover/img:opacity-100 transition-opacity"
                  />
                  <div className="absolute top-2 right-2 bg-[#131314]/80 px-2 py-0.5 text-[10px] font-technical-data text-[#83cffb]">
                    {part.category}
                  </div>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-h3 text-base text-[#e5e2e3] font-bold">
                      {part.name}
                    </h4>
                    <p className="font-technical-data text-xs text-[#ff7a1a] mt-0.5">
                      {part.partNumber}
                    </p>
                  </div>
                  <span className="text-[#ff7a1a] font-technical-data font-bold text-base">
                    ${part.price.toFixed(2)}
                  </span>
                </div>

                <p className="text-xs text-[#a78b7d] line-clamp-2">
                  {part.description}
                </p>

                <div className="flex items-center gap-2 pt-2 border-t border-[#584236]/30">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdd(part);
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 font-label-caps text-xs uppercase font-bold tracking-wider transition-all ${
                      isAdded 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-[#ff7a1a] hover:bg-[#ffb68e] text-black glow-button'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Added to Cart
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" /> Add to Cart
                      </>
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewPartDetails(part);
                    }}
                    className="p-2 border border-[#83cffb]/40 text-[#83cffb] hover:bg-[#83cffb]/10 transition-colors"
                    title="View Technical Specs"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </section>
  );
}
