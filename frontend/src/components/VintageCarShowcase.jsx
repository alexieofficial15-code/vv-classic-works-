import React from 'react';
import { VINTAGE_CARS } from '../data/partsData';
import { Car, Wrench, CheckCircle2, ChevronRight, Gauge, ArrowRight } from 'lucide-react';

export default function VintageCarShowcase({ selectedCarModelId, onSelectCarModel }) {
  const scrollToCatalog = () => {
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCarClick = (carId) => {
    if (selectedCarModelId === carId) {
      onSelectCarModel('ALL');
    } else {
      onSelectCarModel(carId);
      scrollToCatalog();
    }
  };

  return (
    <section id="vintage-cars" className="py-16 bg-[#181719] border-b border-[#584236]/20 relative">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-[#584236]/30 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[#ff7a1a]/10 border border-[#ff7a1a]/30 text-[#ff7a1a] font-technical-data text-xs mb-3">
              <Car className="w-3.5 h-3.5" />
              <span>VINTAGE GARAGE // VEHICLE MATCHING SYSTEM</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-[#e5e2e3] font-h2">
              Browse by <span className="text-[#ff7a1a]">Vintage Car Model</span>
            </h2>
            <p className="text-[#e0c0b1] text-xs md:text-sm mt-1">
              Select your classic vehicle to inspect engine configurations and filter compatible spare parts.
            </p>
          </div>

          {selectedCarModelId && selectedCarModelId !== 'ALL' && (
            <button
              onClick={() => onSelectCarModel('ALL')}
              className="text-xs font-technical-data text-[#83cffb] hover:underline flex items-center gap-1.5 self-start md:self-auto bg-[#131314] px-4 py-2 border border-[#83cffb]/30 rounded-sm"
            >
              Clear Vehicle Filter (Show All Parts)
            </button>
          )}
        </div>

        {/* Vintage Cars Grid */}
        {VINTAGE_CARS.length === 0 ? (
          <div className="bg-[#201f20] border border-dashed border-[#ff7a1a]/40 p-12 text-center rounded-sm">
            <div className="w-12 h-12 rounded-full bg-[#ff7a1a]/10 border border-[#ff7a1a]/30 flex items-center justify-center mx-auto mb-4 text-[#ff7a1a]">
              <Car className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#e5e2e3] font-h2">Previous Car & Engine List Cleared</h3>
            <p className="text-xs text-[#a78b7d] font-technical-data max-w-lg mx-auto mt-2 leading-relaxed">
              We have cancelled the default car list as requested! Provide your custom list of cars with their names, images, and corresponding engine versions under each car, and we will immediately load them into the header & garage catalog.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {VINTAGE_CARS.map((car) => {
              const isSelected = selectedCarModelId === car.id;

              return (
                <div
                  key={car.id}
                  onClick={() => handleCarClick(car.id)}
                  className={`group cursor-pointer bg-[#201f20] border transition-all duration-300 rounded-sm overflow-hidden flex flex-col justify-between hover:translate-y-[-4px] ${
                    isSelected 
                      ? 'border-[#ff7a1a] shadow-[0_0_25px_rgba(255,122,26,0.25)] ring-1 ring-[#ff7a1a]' 
                      : 'border-[#584236]/40 hover:border-[#ff7a1a]/60'
                  }`}
                >
                  {/* Car Image with Badge */}
                  <div className="relative h-44 overflow-hidden bg-black/50">
                    <img
                      src={car.carImage}
                      alt={car.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#201f20] via-transparent to-black/40"></div>

                    {/* Make Tag */}
                    {car.make && (
                      <span className="absolute top-3 left-3 bg-[#131314]/90 backdrop-blur-md text-[#ff7a1a] font-technical-data text-[10px] uppercase tracking-wider px-2.5 py-1 border border-[#ff7a1a]/30">
                        {car.make}
                      </span>
                    )}

                    {/* Era Badge */}
                    {car.era && (
                      <span className="absolute top-3 right-3 bg-[#131314]/90 backdrop-blur-md text-[#e0c0b1] font-technical-data text-[10px] px-2 py-1 border border-[#584236]/40">
                        {car.era}
                      </span>
                    )}

                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className="absolute bottom-2 right-2 bg-[#ff7a1a] text-black text-[10px] font-bold px-2 py-0.5 rounded-xs flex items-center gap-1 font-technical-data">
                        <CheckCircle2 className="w-3 h-3" /> ACTIVE VEHICLE
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#e5e2e3] group-hover:text-[#ff7a1a] transition-colors line-clamp-1 mb-1">
                        {car.name}
                      </h3>

                      {/* Primary Engine or Sub-Engines Count */}
                      <div className="flex items-center gap-1.5 text-xs text-[#83cffb] font-technical-data mb-3">
                        <Wrench className="w-3 h-3 text-[#ff7a1a]" />
                        <span className="truncate">
                          {car.engineName || (car.engines ? `${car.engines.length} Engine Version(s)` : 'Engine Specifications')}
                        </span>
                      </div>

                      {/* Engine Versions List preview if provided */}
                      {car.engines && car.engines.length > 0 && (
                        <div className="mb-4 bg-[#131314]/75 p-2 rounded-xs border border-[#584236]/30 space-y-1">
                          <span className="text-[9px] uppercase font-bold text-[#ff7a1a] block">Engine Versions:</span>
                          {car.engines.map((eng, idx) => (
                            <div key={eng.id || idx} className="text-[10px] text-[#e0c0b1] flex items-center justify-between">
                              <span>• {eng.name}</span>
                              {eng.horsepower && <span className="text-[#a78b7d] text-[9px]">{eng.horsepower}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="pt-3 border-t border-[#584236]/30 flex items-center justify-between">
                      <span className={`text-[10px] font-technical-data font-bold flex items-center gap-1 uppercase transition-colors ${
                        isSelected ? 'text-[#ff7a1a]' : 'text-[#a78b7d] group-hover:text-[#ff7a1a]'
                      }`}>
                        {isSelected ? 'Viewing Parts' : 'View Parts'}
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
