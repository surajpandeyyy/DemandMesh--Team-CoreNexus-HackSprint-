import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Plus, 
  Minus, 
  Sparkles, 
  Check, 
  Package, 
  Clock, 
  Store, 
  AlertCircle,
  CornerDownLeft,
  ArrowRight
} from 'lucide-react';
import { useDemandMesh } from '../../context/DemandMeshContext.tsx';
import { parseMissedDemandText } from '../../utils/math.ts';
import { DemandReason, RequestSource } from '../../types/index.ts';
import { DemoDataBadge } from '../common/DemoDataBadge.tsx';

export const CaptureDemandView: React.FC = () => {
  const { addDemandEntry, products, setActiveTab } = useDemandMesh();

  const [inputMode, setInputMode] = useState<'voice' | 'manual'>('voice');
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [variant, setVariant] = useState(products[0].defaultVariant);
  const [quantity, setQuantity] = useState(3);
  const [reason, setReason] = useState<DemandReason>('OUT_OF_STOCK');
  const [source, setSource] = useState<RequestSource>('VOICE_NOTE');
  const [notes, setNotes] = useState('');
  const [justSaved, setJustSaved] = useState(false);

  // Fast pre-fill presets for Kirana cashiers
  const cashierPresets = [
    { name: 'Protein Oats', variant: '500 g', reason: 'OUT_OF_STOCK' as DemandReason, qty: 3 },
    { name: 'Unsweetened Almond Milk', variant: '1 L', reason: 'OUT_OF_STOCK' as DemandReason, qty: 2 },
    { name: 'Organic Millet Cookies', variant: '200 g', reason: 'NOT_CARRIED' as DemandReason, qty: 1 },
    { name: 'Cold Pressed Virgin Coconut Oil', variant: '500 ml', reason: 'PRICE_MISMATCH' as DemandReason, qty: 2 },
    { name: 'Probiotic Greek Yogurt', variant: '400 g', reason: 'OUT_OF_STOCK' as DemandReason, qty: 3 },
  ];

  const handleProductChange = (prodId: string) => {
    const p = products.find(prod => prod.id === prodId);
    if (p) {
      setSelectedProduct(p);
      setVariant(p.defaultVariant);
    }
  };

  const handleVoiceToggle = () => {
    if (!isListening) {
      setIsListening(true);
      // Simulated or real web speech
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const rec = new SpeechRecognition();
        rec.lang = 'en-IN';
        rec.start();
        rec.onresult = (e: any) => {
          const text = e.results[0][0].transcript;
          setTranscript(text);
          autoFillFromText(text);
          setIsListening(false);
        };
        rec.onerror = () => setIsListening(false);
        rec.onend = () => setIsListening(false);
      } else {
        // Fallback demo speech simulation
        setTimeout(() => {
          const sample = '3 customers asked for Protein Oats, 500 g, but we are out of stock.';
          setTranscript(sample);
          autoFillFromText(sample);
          setIsListening(false);
        }, 1500);
      }
    } else {
      setIsListening(false);
    }
  };

  const autoFillFromText = (text: string) => {
    const parsed = parseMissedDemandText(text);
    const matched = products.find(p => p.name.toLowerCase() === parsed.productName.toLowerCase());
    if (matched) {
      setSelectedProduct(matched);
      setVariant(parsed.variant);
    }
    setQuantity(parsed.quantity);
    setReason(parsed.reason);
  };

  const handleSave = () => {
    addDemandEntry({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      variant,
      quantity,
      reason,
      source,
      status: 'CAPTURED',
      confidenceScore: 0.95,
      rawTranscript: transcript || `${quantity} customers asked for ${selectedProduct.name} ${variant}`,
      notes: notes || 'Logged during shop counter transaction.',
      estimatedLostMargin: quantity * (selectedProduct.sellingPrice - selectedProduct.costPrice),
    });

    setJustSaved(true);
    setTimeout(() => {
      setJustSaved(false);
      setTranscript('');
      setNotes('');
    }, 2200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DFE7EB]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0B1730]">
              Fast Missed-Demand Intake
            </h1>
            <DemoDataBadge />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Record lost sales in under 5 seconds between retail customer interactions
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setInputMode('voice')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              inputMode === 'voice' ? 'bg-white text-[#0B1730] shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice Intake</span>
          </button>
          <button
            onClick={() => setInputMode('manual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              inputMode === 'manual' ? 'bg-white text-[#0B1730] shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Form Selector</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Intake Box */}
      <div className="bg-white rounded-2xl border border-[#DFE7EB] p-6 shadow-sm space-y-6">
        {/* Voice Section */}
        {inputMode === 'voice' && (
          <div className="text-center py-6 px-4 bg-gradient-to-b from-slate-50 to-white rounded-xl border border-slate-100">
            <div className="relative inline-block">
              {isListening && (
                <div className="absolute inset-0 rounded-full bg-[#0BA69C]/20 animate-ping" />
              )}
              <button
                onClick={handleVoiceToggle}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  isListening
                    ? 'bg-rose-500 text-white shadow-rose-200 scale-105'
                    : 'bg-[#0B1730] text-[#31D5CD] hover:bg-[#101F3B] hover:scale-105'
                }`}
                aria-label="Tap to speak missed demand"
              >
                {isListening ? (
                  <MicOff className="w-8 h-8 animate-pulse" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </button>
            </div>

            <h3 className="mt-4 text-sm font-semibold text-[#0B1730]">
              {isListening ? 'Listening to merchant voice note...' : 'Tap microphone and speak naturally'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              e.g. "Three customers asked for Protein Oats, 500 g, but we're out of stock."
            </p>

            {transcript && (
              <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs font-mono text-teal-900 text-left max-w-lg mx-auto">
                <span className="text-[10px] text-teal-600 block uppercase font-bold mb-0.5">
                  Live Transcript:
                </span>
                "{transcript}"
              </div>
            )}
          </div>
        )}

        {/* Quick Kirana Preset Chips */}
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
            Frequent Inquiries / Kirana Presets
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {cashierPresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const p = products.find(prod => prod.name === preset.name);
                  if (p) setSelectedProduct(p);
                  setVariant(preset.variant);
                  setQuantity(preset.qty);
                  setReason(preset.reason);
                  setTranscript(`${preset.qty} customers inquired about ${preset.name} ${preset.variant}`);
                }}
                className={`p-2.5 rounded-lg border text-left transition-all text-xs ${
                  selectedProduct.name === preset.name && variant === preset.variant
                    ? 'bg-teal-50/70 border-[#0BA69C] text-[#0B1730] shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div className="font-semibold truncate">{preset.name}</div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between mt-1">
                  <span>{preset.variant}</span>
                  <span className="font-mono text-[#0BA69C]">{preset.qty} inquiries</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Form Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          {/* Product Selector */}
          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase mb-1">
              Product Catalog Item
            </label>
            <select
              value={selectedProduct.id}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full text-xs font-medium p-2.5 border border-slate-200 rounded-lg bg-white text-[#0B1730] focus:ring-2 focus:ring-[#0BA69C]/30 focus:border-[#0BA69C]"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category}) {!p.isCarried ? '· [New Assortment]' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Variant Selector */}
          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase mb-1">
              Pack Size / Variant
            </label>
            <select
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
              className="w-full text-xs font-medium p-2.5 border border-slate-200 rounded-lg bg-white text-[#0B1730] focus:ring-2 focus:ring-[#0BA69C]/30 focus:border-[#0BA69C]"
            >
              {selectedProduct.variants.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Quantity Stepper */}
          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase mb-1">
              Customer Inquiry Count
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2.5 border border-slate-200 rounded-l-lg hover:bg-slate-50 text-slate-600"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full text-center text-xs font-mono font-bold p-2.5 border-y border-slate-200 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="p-2.5 border border-slate-200 rounded-r-lg hover:bg-slate-50 text-slate-600"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Reason for Lost Sale */}
          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase mb-1">
              Reason for Non-Purchase
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as DemandReason)}
              className="w-full text-xs font-medium p-2.5 border border-slate-200 rounded-lg bg-white text-[#0B1730] focus:ring-2 focus:ring-[#0BA69C]/30 focus:border-[#0BA69C]"
            >
              <option value="OUT_OF_STOCK">Out of Stock (Existing Inventory Depleted)</option>
              <option value="NOT_CARRIED">Product Not Carried (Assortment Gap)</option>
              <option value="VARIANT_UNAVAILABLE">Requested Variant/Size Unavailable</option>
              <option value="PRICE_MISMATCH">Price Mismatch / Customer Expected Cheaper</option>
              <option value="OTHER">Other Availability Issue</option>
            </select>
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-mono text-slate-500 uppercase mb-1">
            Contextual Merchant Notes (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Fitness gym customers asking for Quaker or MuscleBlaze 500g pouch"
            className="w-full text-xs p-2.5 border border-slate-200 rounded-lg text-[#0B1730] placeholder:text-slate-400 focus:ring-2 focus:ring-[#0BA69C]/30 focus:border-[#0BA69C]"
          />
        </div>

        {/* Submit Bar */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Estimated margin opportunity: <span className="font-mono font-bold text-[#0B1730]">₹{quantity * (selectedProduct.sellingPrice - selectedProduct.costPrice)}</span>
          </div>

          <button
            onClick={handleSave}
            disabled={justSaved}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              justSaved
                ? 'bg-emerald-600 text-white'
                : 'bg-[#0BA69C] hover:bg-[#0BA69C]/90 text-white'
            }`}
          >
            {justSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Demand Recorded!</span>
              </>
            ) : (
              <>
                <span>Commit to Demand Ledger</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
