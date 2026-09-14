import React, { useState } from 'react';
import { usageChartData } from '../data/mockData';

export const UsageChart = () => {
  const [activeTab, setActiveTab] = useState('1M');
  const [hoveredPoint, setHoveredPoint] = useState(usageChartData[3]); // default highlighted 12 PM

  const timeTabs = ['1D', '1W', '1M', '3M', '1Y'];

  // 6 points scaled into SVG viewBox: width=600, height=220
  // X coordinates: 50, 150, 250, 350, 450, 550
  // Y coordinates: occupancy 0 -> y=180, occupancy 1 -> y=100, occupancy 2 -> y=30
  const points = [
    { x: 50, y: 180, item: usageChartData[0] },
    { x: 150, y: 180, item: usageChartData[1] },
    { x: 250, y: 100, item: usageChartData[2] },
    { x: 350, y: 100, item: usageChartData[3] },
    { x: 450, y: 30, item: usageChartData[4] },
    { x: 550, y: 100, item: usageChartData[5] },
  ];

  const pathD = `M ${points[0].x} ${points[0].y} ` +
    points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');

  const areaD = `${pathD} L 550 180 L 50 180 Z`;

  return (
    <div className="bg-neutral-800 border border-neutral-700/60 rounded-3xl p-6 shadow-lg shadow-black/20 space-y-6">
      {/* Chart Header & Time Range Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight">
            Parking Occupancy
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Average occupancy distribution
          </p>
        </div>

        {/* Time Range Tabs */}
        <div className="flex items-center bg-neutral-900 p-1 rounded-2xl border border-neutral-700/60 self-start sm:self-auto">
          {timeTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-blue-glow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Line Chart Container */}
      <div className="relative pt-4">
        {/* Floating Tooltip for Highlighted/Hovered Point */}
        {hoveredPoint && (
          <div className="mb-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700/80 text-xs shadow-md">
            <span className="font-semibold text-white">{hoveredPoint.time}</span>
            <span className="text-neutral-400">•</span>
            <span className="text-blue-400 font-medium">{hoveredPoint.label}</span>
          </div>
        )}

        <div className="w-full h-56">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 600 220" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            <line x1="40" y1="30" x2="560" y2="30" stroke="#333333" strokeDasharray="3 3" />
            <line x1="40" y1="100" x2="560" y2="100" stroke="#333333" strokeDasharray="3 3" />
            <line x1="40" y1="180" x2="560" y2="180" stroke="#333333" />

            {/* Y Axis Labels */}
            <text x="25" y="34" fill="#737373" fontSize="11" textAnchor="end">2</text>
            <text x="25" y="104" fill="#737373" fontSize="11" textAnchor="end">1</text>
            <text x="25" y="184" fill="#737373" fontSize="11" textAnchor="end">0</text>

            {/* Area under curve */}
            <path d={areaD} fill="url(#chartGradient)" />

            {/* Blue Line */}
            <path
              d={pathD}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Points */}
            {points.map((pt, idx) => {
              const isSelected = hoveredPoint?.time === pt.item.time;
              return (
                <g
                  key={idx}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(pt.item)}
                >
                  {/* Subtle pulsing highlight ring for 12 PM or selected */}
                  {isSelected && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="9"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2"
                      opacity="0.6"
                      className="animate-pulse"
                    />
                  )}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? "5" : "4"}
                    fill="#1e1e1e"
                    stroke="#3B82F6"
                    strokeWidth="2.5"
                    className="transition-all duration-200"
                  />
                </g>
              );
            })}

            {/* X Axis Labels */}
            {points.map((pt, idx) => (
              <text
                key={idx}
                x={pt.x}
                y="206"
                fill="#737373"
                fontSize="11"
                textAnchor="middle"
                fontFamily="inherit"
              >
                {pt.item.time}
              </text>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
};
