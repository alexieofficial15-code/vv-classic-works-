import React, { useState } from 'react';
import { VW_NAV_CATEGORIES, DETAILED_ENGINES } from '../data/vwNavigationData';
import { X, Car, Cpu, Wrench, CheckCircle2, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

export default function GuidedSearchModal({ 
  isOpen, 
  onClose, 
  onApplySelection 
}) {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedEngine, setSelectedEngine] = useState(null);

  if (!isOpen) return null;

  const handleSelectCat = (cat) => {
    setSelectedCategory(cat);
    setSelectedModel(null);
    setStep(2);
  };

  const handleSelectMod = (mod) => {
    setSelectedModel(mod);
    setStep(3);
  };

  const handleSelectEng = (eng) => {
    setSelectedEngine(eng);
    setStep(4);
  };

  const handleFinish = () => {
    onApplySelection({
      categoryId: selectedCategory?.id || 'ALL',
      modelId: selectedModel?.id || 'ALL',
      engineSize: selectedEngine?.size || 'ALL'
    });
    onClose();

    const catalogEl = document.getElementById('catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleResetModal = () => {
    setStep(1);
    setSelectedCategory(null);
    setSelectedModel(null);
    setSelectedEngine(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-[#181719] border border-[#ff7a1a]/50 rounded-xs shadow-[0_0_50px_rgba(255,122,26,0.3)] p-4 sm:p-6 md:p-8 font-technical-data text-white my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 min-w-[36px] min-h-[36px] flex items-center justify-center p-2 text-[#a78b7d] hover:text-[#ff7a1a] transition-colors cursor-pointer"
          aria-label="Close guided search"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 pb-4 border-b border-[#584236]/40">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff7a1a]/10 border border-[#ff7a1a]/30 text-[#ff7a1a] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GUIDED VEHICLE SELECTOR WIZARD</span>
          </div>
          <h3 className="text-2xl font-bold text-[#e5e2e3] font-h2">
            Find Parts For My <span className="text-[#ff7a1a]">Volkswagen</span>
          </h3>
          <p className="text-xs text-[#a78b7d] mt-1">
            Follow the 4-step wizard to find compatible air-cooled parts.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-bold text-[#a78b7d] mb-2">
            <span className={step >= 1 ? 'text-[#ff7a1a]' : ''}>1. Category</span>
            <span className={step >= 2 ? 'text-[#ff7a1a]' : ''}>2. Model</span>
            <span className={step >= 3 ? 'text-[#ff7a1a]' : ''}>3. Engine</span>
            <span className={step === 4 ? 'text-[#ff7a1a]' : ''}>4. Results</span>
          </div>
          <div className="w-full h-1.5 bg-[#201f20] rounded-full overflow-hidden border border-[#584236]/40">
            <div 
              className="h-full bg-[#ff7a1a] transition-all duration-500"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* STEP 1: CHOOSE VEHICLE CATEGORY */}
        {step === 1 && (
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-wider text-[#ff7a1a] font-bold">
              Step 1: Choose Vehicle Category
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[360px] overflow-y-auto pr-1">
              {VW_NAV_CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => handleSelectCat(cat)}
                  className="p-4 bg-[#201f20] border border-[#584236]/50 hover:border-[#ff7a1a] rounded-xs cursor-pointer transition-all hover:bg-[#2c2a2c] group"
                >
                  <Car className="w-6 h-6 text-[#ff7a1a] mb-2 group-hover:scale-110 transition-transform" />
                  <h5 className="text-sm font-bold text-[#e5e2e3] group-hover:text-[#ff7a1a]">{cat.name}</h5>
                  <p className="text-[10px] text-[#a78b7d] mt-1">{cat.modelsCount} • {cat.partsCount}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: CHOOSE MODEL */}
        {step === 2 && selectedCategory && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase tracking-wider text-[#ff7a1a] font-bold">
                Step 2: Choose Model ({selectedCategory.name})
              </h4>
              <button onClick={() => setStep(1)} className="text-xs text-[#83cffb] flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[360px] overflow-y-auto pr-1">
              {selectedCategory.models.map((mod) => (
                <div
                  key={mod.id}
                  onClick={() => handleSelectMod(mod)}
                  className="p-4 bg-[#201f20] border border-[#584236]/50 hover:border-[#ff7a1a] rounded-xs cursor-pointer transition-all hover:bg-[#2c2a2c] group"
                >
                  <h5 className="text-sm font-bold text-[#e5e2e3] group-hover:text-[#ff7a1a]">{mod.name}</h5>
                  <p className="text-xs text-[#a78b7d] mt-1">Era: {mod.era}</p>
                  <span className="text-[10px] text-[#83cffb] block mt-2 font-bold">{mod.partsCount}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: CHOOSE ENGINE */}
        {step === 3 && selectedModel && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase tracking-wider text-[#ff7a1a] font-bold">
                Step 3: Choose Engine ({selectedModel.name})
              </h4>
              <button onClick={() => setStep(2)} className="text-xs text-[#83cffb] flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[360px] overflow-y-auto pr-1">
              {DETAILED_ENGINES.map((eng) => (
                <div
                  key={eng.size}
                  onClick={() => handleSelectEng(eng)}
                  className="p-3 bg-[#201f20] border border-[#584236]/50 hover:border-[#ff7a1a] rounded-xs cursor-pointer transition-all hover:bg-[#2c2a2c] text-center group"
                >
                  <Cpu className="w-5 h-5 text-[#ff7a1a] mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-[#e5e2e3] block group-hover:text-[#ff7a1a]">{eng.size}</span>
                  <span className="text-[9px] text-[#a78b7d] block mt-0.5">{eng.category}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: SHOW COMPATIBLE PARTS READY */}
        {step === 4 && (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#ff7a1a]/20 border border-[#ff7a1a] flex items-center justify-center mx-auto text-[#ff7a1a]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-[#e5e2e3]">Vehicle Match Complete!</h4>
            <div className="bg-[#201f20] p-4 rounded-xs border border-[#584236]/50 max-w-md mx-auto text-xs space-y-1 text-left font-technical-data">
              <div className="flex justify-between">
                <span className="text-[#a78b7d]">CATEGORY:</span>
                <span className="text-[#ff7a1a] font-bold">{selectedCategory?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a78b7d]">MODEL:</span>
                <span className="text-[#e5e2e3] font-bold">{selectedModel?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a78b7d]">ENGINE:</span>
                <span className="text-[#83cffb] font-bold">{selectedEngine?.size} ({selectedEngine?.category})</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={handleResetModal}
                className="text-xs text-[#a78b7d] hover:text-white px-4 py-2"
              >
                Change Selection
              </button>
              <button
                onClick={handleFinish}
                className="font-label-caps text-xs text-black bg-[#ff7a1a] hover:bg-[#ffb68e] px-8 py-3 rounded-xs font-bold uppercase tracking-wider flex items-center gap-2 glow-button"
              >
                <span>View Compatible Spare Parts</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
