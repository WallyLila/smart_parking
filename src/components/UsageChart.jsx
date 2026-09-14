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
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-soft dark:shadow-none space-y-6 transition-colors duration-200">
      {/* Chart Header & Time Range Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white tracking-tight transition-colors">
            Parking Occupancy
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-medium transition-colors">
            Average occupancy distribution across 2 monitored bays
          </p>
        </div>

        {/* Time Range Tabs */}
        <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-full border border-neutral-200/60 dark:border-neutral-700 self-start sm:self-auto transition-colors">
          {timeTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Line Chart Container */}
      <div className="relative pt-2">
        {/* Floating Tooltip for Highlighted/Hovered Point */}
        {hoveredPoint && (
          <div className="mb-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 dark:bg-neutral-800 border border-neutral-800 dark:border-neutral-700 text-white text-xs shadow-soft-sm font-medium transition-colors">
            <span className="font-bold">{hoveredPoint.time}</span>
            <span className="text-neutral-400">•</span>
            <span className="text-neutral-200 dark:text-neutral-300">{hoveredPoint.label}</span>
          </div>
        )}

        <div className="w-full h-56">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 600 220" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradientLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#111827" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#111827" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="chartGradientDark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            <line x1="40" y1="30" x2="560" y2="30" className="stroke-[#f0f2f5] dark:stroke-[#262626]" strokeDasharray="4 4" strokeWidth="1.5" />
            <line x1="40" y1="100" x2="560" y2="100" className="stroke-[#f0f2f5] dark:stroke-[#262626]" strokeDasharray="4 4" strokeWidth="1.5" />
            <line x1="40" y1="180" x2="560" y2="180" className="stroke-[#e5e7eb] dark:stroke-[#333333]" strokeWidth="1.5" />

            {/* Y Axis Labels */}
            <text x="25" y="34" className="fill-neutral-400 dark:fill-neutral-500 text-[11px] font-semibold" textAnchor="end">2</text>
            <text x="25" y="104" className="fill-neutral-400 dark:fill-neutral-500 text-[11px] font-semibold" textAnchor="end">1</text>
            <text x="25" y="184" className="fill-neutral-400 dark:fill-neutral-500 text-[11px] font-semibold" textAnchor="end">0</text>

            {/* Area under curve */}
            <path d={areaD} className="fill-[url(#chartGradientLight)] dark:fill-[url(#chartGradientDark)]" />

            {/* Charcoal / Blue Line */}
            <path
              d={pathD}
              fill="none"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-neutral-900 dark:stroke-blue-400"
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
                  {/* Subtle pulsing highlight ring for selected */}
                  {isSelected && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="10"
                      fill="none"
                      strokeWidth="2"
                      opacity="0.3"
                      className="animate-pulse stroke-neutral-900 dark:stroke-blue-400"
                    />
                  )}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? "5.5" : "4"}
                    strokeWidth="3"
                    className="transition-all duration-200 fill-white dark:fill-neutral-900 stroke-neutral-900 dark:stroke-blue-400"
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
                className="fill-neutral-400 dark:fill-neutral-500 text-[11px] font-semibold"
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
