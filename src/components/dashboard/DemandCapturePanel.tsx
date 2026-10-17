import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Sparkles, Check, Edit2, ArrowRight, CornerDownLeft, Package } from 'lucide-react';
import { useDemandMesh } from '../../context/DemandMeshContext.tsx';
import { parseMissedDemandText, ParsedRequest } from '../../utils/math.ts';
import { DemandReason } from '../../types/index.ts';

export const DemandCapturePanel: React.FC = () => {
  const { addDemandEntry, products, selectedProduct } = useDemandMesh();
  
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [parsedCard, setParsedCard] = useState<ParsedRequest | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmedSuccess, setConfirmedSuccess] = useState(false);

  // Check Web Speech API support
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setSpeechSupported(true);
    }
  }, []);

  const handleToggleVoice = () => {
    if (!speechSupported) {
      // Graceful fallback: set golden prompt with notice
      setInputText('3 customers asked for Protein Oats, 500 g, but we are out of stock.');
      handleParse('3 customers asked for Protein Oats, 500 g, but we are out of stock.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN'; // Indian English / Kirana context

    if (!isListening) {
      setIsListening(true);
      recognition.start();

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        handleParse(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      recognition.stop();
      setIsListening(false);
    }
  };

  const handleParse = (textToParse?: string) => {
    const target = textToParse || inputText;
    if (!target.trim()) return;
    const parsed = parseMissedDemandText(target);
    setParsedCard(parsed);
    setIsEditing(false);
  };

  const handleConfirm = () => {
    if (!parsedCard) return;

    // Find product id in catalog
    const matched = products.find(p => p.name.toLowerCase() === parsedCard.productName.toLowerCase()) || selectedProduct;

    addDemandEntry({
      productId: matched.id,
      productName: parsedCard.productName,
      variant: parsedCard.variant,
      quantity: parsedCard.quantity,
      reason: parsedCard.reason as DemandReason,
      source: isListening ? 'VOICE_NOTE' : 'COUNTER_INQUIRY',
      status: 'CAPTURED',
      confidenceScore: parsedCard.confidenceScore,
      rawTranscript: parsedCard.rawText,
      notes: 'Captured via merchant console quick intake.',
      estimatedLostMargin: parsedCard.quantity * (matched.sellingPrice - matched.costPrice),
    });

    setConfirmedSuccess(true);
    setTimeout(() => {
      setConfirmedSuccess(false);
      setParsedCard(null);
      setInputText('');
    }, 2800);
  };

  const quickPrompts = [
    '3 customers asked for Protein Oats, 500 g, but we are out of stock.',
    '2 people wanted 1L Almond Milk, shelf empty since morning.',
    'Customer asked for Organic Millet Cookies 200g, we do not carry it.',
  ];

  return (
    <div className="bg-white rounded-xl border border-[#DFE7EB] p-5 shadow-xs">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-[#0B1730] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0BA69C]" />
            <span>Capture Missed Customer Demand</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Record what customers tried to buy but walked away empty-handed
          </p>
        </div>
      </div>

      {/* Voice / Text Input Box */}
      <div className="mt-4">
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleParse();
              }
            }}
            placeholder="Speak or type: '3 customers asked for Protein Oats, 500 g, but we are out of stock'..."
            rows={2}
            className="w-full text-sm rounded-lg border border-slate-200 p-3 pr-24 focus:outline-none focus:ring-2 focus:ring-[#0BA69C]/30 focus:border-[#0BA69C] transition-all resize-none text-[#0B1730] placeholder:text-slate-400"
          />

          <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
            {/* Mic Button */}
            <button
              onClick={handleToggleVoice}
              className={`p-2 rounded-lg transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-[#101F3B] hover:text-[#31D5CD]'
              }`}
              title={speechSupported ? 'Record with microphone' : 'Voice recognition: Click to load demo audio prompt'}
              aria-label="Microphone input"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Parse Submit Button */}
            <button
              onClick={() => handleParse()}
              disabled={!inputText.trim()}
              className="p-2 bg-[#0B1730] text-white rounded-lg hover:bg-[#101F3B] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Parse missed demand"
              aria-label="Submit text"
            >
              <CornerDownLeft className="w-4 h-4 text-[#31D5CD]" />
            </button>
          </div>
        </div>

        {/* Quick Demo Prompts */}
        <div className="mt-2.5 flex items-center flex-wrap gap-1.5 text-xs">
          <span className="text-[11px] text-slate-400 mr-1">Quick prompts:</span>
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => {
                setInputText(prompt);
                handleParse(prompt);
              }}
              className="text-left text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors truncate max-w-[280px]"
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </div>

      {/* AI-Parsed Review Card */}
      {parsedCard && (
        <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in duration-200">
          <div className="bg-[#FAF8F2] border border-[#DFE7EB] rounded-lg p-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#DFE7EB]">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#0BA69C]" />
                <span className="text-xs font-semibold text-[#0B1730]">
                  AI-Extracted Demand Event
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {Math.round(parsedCard.confidenceScore * 100)}% match confidence
                </span>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs text-slate-500 hover:text-[#0B1730] flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>{isEditing ? 'Done' : 'Edit'}</span>
              </button>
            </div>

            {/* Structured Fields */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Product</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={parsedCard.productName}
                    onChange={(e) => setParsedCard({ ...parsedCard, productName: e.target.value })}
                    className="w-full mt-1 p-1 text-xs border rounded bg-white"
                  />
                ) : (
                  <div className="font-semibold text-[#0B1730] mt-0.5 truncate">{parsedCard.productName}</div>
                )}
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Variant</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={parsedCard.variant}
                    onChange={(e) => setParsedCard({ ...parsedCard, variant: e.target.value })}
                    className="w-full mt-1 p-1 text-xs border rounded bg-white"
                  />
                ) : (
                  <div className="font-semibold text-[#0B1730] mt-0.5">{parsedCard.variant}</div>
                )}
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Inquiry Count</span>
                {isEditing ? (
                  <input
                    type="number"
                    min="1"
                    value={parsedCard.quantity}
                    onChange={(e) => setParsedCard({ ...parsedCard, quantity: parseInt(e.target.value, 10) || 1 })}
                    className="w-full mt-1 p-1 text-xs border rounded bg-white"
                  />
                ) : (
                  <div className="font-semibold text-[#0B1730] mt-0.5 font-mono">{parsedCard.quantity} units</div>
                )}
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Reason</span>
                {isEditing ? (
                  <select
                    value={parsedCard.reason}
                    onChange={(e) => setParsedCard({ ...parsedCard, reason: e.target.value as any })}
                    className="w-full mt-1 p-1 text-xs border rounded bg-white"
                  >
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                    <option value="NOT_CARRIED">Not Carried</option>
                    <option value="VARIANT_UNAVAILABLE">Variant Unavailable</option>
                    <option value="PRICE_MISMATCH">Price Mismatch</option>
                    <option value="OTHER">Other</option>
                  </select>
                ) : (
                  <div className="font-semibold text-[#DCA84E] mt-0.5">
                    {parsedCard.reason.replace(/_/g, ' ')}
                  </div>
                )}
              </div>
            </div>

            {/* Confirmation CTA */}
            <div className="mt-4 pt-3 border-t border-[#DFE7EB] flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Verify fields before committing to Demand Ledger
              </span>

              <button
                onClick={handleConfirm}
                disabled={confirmedSuccess}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  confirmedSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#0BA69C] hover:bg-[#0BA69C]/90 text-white shadow-xs'
                }`}
              >
                {confirmedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved into Ledger!</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Persist Signal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
