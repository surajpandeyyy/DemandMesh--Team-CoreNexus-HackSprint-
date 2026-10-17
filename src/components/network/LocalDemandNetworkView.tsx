import React, { useState } from 'react';
import { 
  Share2, 
  Store, 
  MapPin, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Percent,
  Sparkles,
  Info
} from 'lucide-react';
import { useDemandMesh } from '../../context/DemandMeshContext.tsx';
import { ParticipatingStore } from '../../types/index.ts';
import { DemoDataBadge } from '../common/DemoDataBadge.tsx';

export const LocalDemandNetworkView: React.FC = () => {
  const { 
    stores, 
    selectedProduct, 
    poolingAnalysis, 
    setIsPooledModalOpen 
  } = useDemandMesh();

  const [hoveredStore, setHoveredStore] = useState<ParticipatingStore | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DFE7EB]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0B1730]">
              Local Demand Network
            </h1>
            <DemoDataBadge />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Decentralized demand aggregation across neighboring kiranas to unlock bulk distributor tiers without inventory risk
          </p>
        </div>

        {/* Review Pooled Order Trigger */}
        <button
          onClick={() => setIsPooledModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0BA69C] hover:bg-[#0BA69C]/90 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
        >
          <Users className="w-4 h-4" />
          <span>Review Pooled Order ({poolingAnalysis.currentPooledQuantity}/{poolingAnalysis.moq})</span>
        </button>
      </div>

      {/* Privacy by Design Banner */}
      <div className="bg-[#FAF8F2] border border-[#DFE7EB] rounded-xl p-4 text-xs text-slate-600 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#0BA69C] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#0B1730]">Privacy by Design:</strong> Participating kirana stores share eligible aggregated demand signals, never their raw individual customer records or proprietary store receipts. All purchase commitments are matched with zero data leakage.
        </div>
      </div>

      {/* Main Grid: Interactive Map Visualizer & Cluster Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Map / Topology */}
        <div className="lg:col-span-2 bg-[#0B1730] rounded-2xl border border-[#101F3B] p-6 text-white relative overflow-hidden min-h-[420px] flex flex-col justify-between">
          {/* Map Top Bar */}
          <div className="flex items-center justify-between z-10">
            <div>
              <span className="text-[10px] font-mono tracking-wider text-[#31D5CD] uppercase">
                Bengaluru East · Indiranagar Cluster
              </span>
              <h3 className="text-base font-bold text-white">
                Neighborhood Kirana Demand Topology
              </h3>
            </div>

            <div className="flex items-center gap-1.5 bg-[#101F3B] px-2.5 py-1 rounded-lg border border-slate-700 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{stores.length} Connected Stores</span>
            </div>
          </div>

          {/* Canvas SVG Map Surface */}
          <div className="relative w-full h-80 my-4">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Radial signal rings around central current store */}
              <circle cx="48" cy="46" r="18" fill="none" stroke="#0BA69C" strokeWidth="0.4" strokeDasharray="1 1" opacity="0.4" />
              <circle cx="48" cy="46" r="32" fill="none" stroke="#0BA69C" strokeWidth="0.4" strokeDasharray="1 1" opacity="0.25" />

              {/* Connecting lines between current store (store_01) and neighbors */}
              {stores.filter(s => !s.isCurrentUserStore).map((store) => (
                <line
                  key={`line-${store.id}`}
                  x1="48"
                  y1="46"
                  x2={store.coordinates.x}
                  y2={store.coordinates.y}
                  stroke="#31D5CD"
                  strokeWidth={hoveredStore?.id === store.id ? '1.2' : '0.6'}
                  strokeDasharray="2 1.5"
                  opacity={hoveredStore?.id === store.id ? 0.9 : 0.4}
                  className="transition-all duration-300"
                />
              ))}

              {/* Store Nodes */}
              {stores.map((store) => {
                const isCurrent = store.isCurrentUserStore;
                const isHovered = hoveredStore?.id === store.id;
                return (
                  <g 
                    key={store.id} 
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredStore(store)}
                    onMouseLeave={() => setHoveredStore(null)}
                  >
                    {/* Pulsing ring for current store */}
                    {isCurrent && (
                      <circle
                        cx={store.coordinates.x}
                        cy={store.coordinates.y}
                        r="6"
                        fill="none"
                        stroke="#31D5CD"
                        strokeWidth="0.8"
                        className="animate-ping"
                      />
                    )}

                    {/* Node circle */}
                    <circle
                      cx={store.coordinates.x}
                      cy={store.coordinates.y}
                      r={isCurrent ? 4.5 : isHovered ? 4 : 3}
                      fill={isCurrent ? '#31D5CD' : '#0BA69C'}
                      stroke="#FFFFFF"
                      strokeWidth={isHovered ? 1.5 : 0.8}
                    />

                    {/* Node Label */}
                    <text
                      x={store.coordinates.x}
                      y={store.coordinates.y + 6}
                      textAnchor="middle"
                      className={`text-[3.2px] font-mono select-none ${
                        isCurrent ? 'fill-white font-bold' : 'fill-slate-300'
                      }`}
                    >
                      {store.name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Box */}
            {hoveredStore && (
              <div 
                className="absolute bg-[#101F3B] border border-[#1a2f54] text-white p-3 rounded-xl shadow-xl text-xs z-20 pointer-events-none font-mono"
                style={{
                  left: `${Math.min(70, Math.max(10, hoveredStore.coordinates.x))}%`,
                  top: `${Math.min(65, Math.max(10, hoveredStore.coordinates.y))}%`,
                  transform: 'translate(-50%, -120%)',
                }}
              >
                <div className="font-bold text-white text-xs">{hoveredStore.name}</div>
                <div className="text-[10px] text-slate-400">{hoveredStore.neighborhood} · {hoveredStore.distanceKm} km away</div>
                <div className="mt-2 pt-2 border-t border-slate-700/80 space-y-1">
                  <div className="flex justify-between gap-4 text-[#31D5CD]">
                    <span>Pledged Protein Oats:</span>
                    <span className="font-bold">{hoveredStore.proteinOatsCommitment} units</span>
                  </div>
                  <div className="flex justify-between gap-4 text-slate-300 text-[10px]">
                    <span>Missed Inquiries Logged:</span>
                    <span>{hoveredStore.totalMissedRequestsLogged}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Map Footer Bar */}
          <div className="pt-3 border-t border-[#101F3B] flex items-center justify-between text-xs text-slate-400 font-mono z-10">
            <span>Aggregated Cluster Demand: {poolingAnalysis.currentPooledQuantity} units</span>
            <span>Distributor MOQ Target: {poolingAnalysis.moq} units</span>
          </div>
        </div>

        {/* Right Col: Pooled Order Opportunity Breakdown */}
        <div className="space-y-6">
          {/* Opportunity Card */}
          <div className="bg-white rounded-xl border border-[#DFE7EB] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-[#0B1730]">
                Active Pooled Opportunity
              </h3>
              <DemoDataBadge />
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-400 font-mono">Product SKU:</span>
                <div className="font-bold text-sm text-[#0B1730] mt-0.5">
                  {selectedProduct.name} ({selectedProduct.defaultVariant})
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-500">Current Pledges:</span>
                  <span className="font-bold text-[#0BA69C]">
                    {poolingAnalysis.currentPooledQuantity} of {poolingAnalysis.moq} units
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#0BA69C] h-full rounded-full transition-all duration-500"
                    style={{ width: `${poolingAnalysis.progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>{poolingAnalysis.progressPercent}% to MOQ</span>
                  <span>{poolingAnalysis.remainingToMoq} units needed</span>
                </div>
              </div>

              {/* Financial comparison */}
              <div className="p-3 bg-[#FAF8F2] rounded-lg border border-[#DFE7EB] space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Standard Solo Cost:</span>
                  <span className="font-mono line-through text-slate-400">₹{selectedProduct.costPrice}/unit</span>
                </div>
                <div className="flex justify-between items-center font-bold text-[#0BA69C]">
                  <span>Tier-1 Pooled Price:</span>
                  <span className="font-mono">₹{Math.round(selectedProduct.costPrice * 0.85)}/unit (-15%)</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#DFE7EB]">
                  <span className="text-slate-700 font-semibold">Net Network Savings:</span>
                  <span className="font-mono font-bold text-emerald-700">₹{poolingAnalysis.currentPooledQuantity * (selectedProduct.costPrice * 0.15)}</span>
                </div>
              </div>

              <button
                onClick={() => setIsPooledModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0B1730] hover:bg-[#101F3B] text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <span>Allocate My Store's Order</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#31D5CD]" />
              </button>
            </div>
          </div>

          {/* Participating Stores Breakdown */}
          <div className="bg-white rounded-xl border border-[#DFE7EB] p-5 shadow-xs">
            <h4 className="text-xs font-semibold text-[#0B1730] pb-2 border-b border-slate-100">
              Pledged Quantities by Store
            </h4>
            <div className="divide-y divide-slate-100 mt-2 max-h-56 overflow-y-auto">
              {stores.map((s) => (
                <div key={s.id} className="py-2 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-[#0B1730]">
                      {s.name} {s.isCurrentUserStore && <span className="text-[10px] text-[#0BA69C]">(You)</span>}
                    </div>
                    <div className="text-[10px] text-slate-400">{s.neighborhood}</div>
                  </div>
                  <div className="font-mono font-bold text-[#0B1730]">
                    {s.proteinOatsCommitment} units
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
