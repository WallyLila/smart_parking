import React, { useState, useMemo } from 'react';

export const UsageChart = ({ activities = [] }) => {
  const [activeTab, setActiveTab] = useState('1D'); // '1D', '1W', '1M', '3M', '1Y'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const timeTabs = ['1D', '1W', '1M', '3M', '1Y'];

  // Process activities into dynamic chart points based on activeTab
  const chartData = useMemo(() => {
    const now = new Date();
    const occupiedActivities = activities.filter((a) => a.status === 'occupied');

    if (activeTab === '1D') {
      // 6 time blocks for 24 hours: 12 AM, 4 AM, 8 AM, 12 PM, 4 PM, 8 PM
      const blocks = [
        { label: '12 AM', startH: 0, endH: 4 },
        { label: '4 AM', startH: 4, endH: 8 },
        { label: '8 AM', startH: 8, endH: 12 },
        { label: '12 PM', startH: 12, endH: 16 },
        { label: '4 PM', startH: 16, endH: 20 },
        { label: '8 PM', startH: 20, endH: 24 },
      ];

      return blocks.map((b) => {
        const count = occupiedActivities.filter((item) => {
          const d = item.created_at ? new Date(item.created_at) : null;
          if (!d) return false;
          const h = d.getHours();
          return h >= b.startH && h < b.endH;
        }).length;

        return {
          time: b.label,
          count,
          label: `${count} ${count === 1 ? 'Car Parked' : 'Cars Parked'} (รถเข้าจอด)`,
        };
      });
    }

    if (activeTab === '1W') {
      // Last 7 days
      const days = [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      for (let i = 6; i >= 0; i--) {
        const targetDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayStr = dayNames[targetDate.getDay()];
        const count = occupiedActivities.filter((item) => {
          const d = item.created_at ? new Date(item.created_at) : null;
          if (!d) return false;
          return d.toDateString() === targetDate.toDateString();
        }).length;

        days.push({
          time: i === 0 ? 'Today' : dayStr,
          count,
          label: `${count} Cars Parked on ${dayStr}`,
        });
      }
      return days;
    }

    if (activeTab === '1M') {
      // 6 5-day intervals across past 30 days
      const intervals = [
        { label: 'Day 1-5', daysAgoStart: 30, daysAgoEnd: 25 },
        { label: 'Day 6-10', daysAgoStart: 25, daysAgoEnd: 20 },
        { label: 'Day 11-15', daysAgoStart: 20, daysAgoEnd: 15 },
        { label: 'Day 16-20', daysAgoStart: 15, daysAgoEnd: 10 },
        { label: 'Day 21-25', daysAgoStart: 10, daysAgoEnd: 5 },
        { label: 'Recent', daysAgoStart: 5, daysAgoEnd: 0 },
      ];

      return intervals.map((inv) => {
        const startMs = now.getTime() - inv.daysAgoStart * 24 * 60 * 60 * 1000;
        const endMs = now.getTime() - inv.daysAgoEnd * 24 * 60 * 60 * 1000;

        const count = occupiedActivities.filter((item) => {
          const d = item.created_at ? new Date(item.created_at) : null;
          if (!d) return false;
          const t = d.getTime();
          return t >= startMs && t <= endMs;
        }).length;

        return {
          time: inv.label,
          count,
          label: `${count} Parkings (${inv.label})`,
        };
      });
    }

    // 3M & 1Y: Monthly view
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const results = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = months[d.getMonth()];
      const count = occupiedActivities.filter((item) => {
        const itemD = item.created_at ? new Date(item.created_at) : null;
        if (!itemD) return false;
        return itemD.getMonth() === d.getMonth() && itemD.getFullYear() === d.getFullYear();
      }).length;

      results.push({
        time: mName,
        count,
        label: `${count} Parkings in ${mName}`,
      });
    }
    return results;
  }, [activities, activeTab]);

  // Scaled coordinates inside SVG viewBox: width=600, height=220
  const maxCount = Math.max(...chartData.map((d) => d.count), 2);
  const xCoords = chartData.map((_, i) => 50 + (i * (500 / Math.max(1, chartData.length - 1))));

  const points = chartData.map((item, idx) => {
    const x = xCoords[idx];
    const y = 180 - (item.count / maxCount) * 150;
    return { x, y, item };
  });

  const pathD = points.length > 0
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ')
    : 'M 50 180 L 550 180';

  const areaD = `${pathD} L 550 180 L 50 180 Z`;

  const totalPeriodParkings = chartData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-soft dark:shadow-none space-y-6 transition-colors duration-200">
      {/* Chart Header & Time Range Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white tracking-tight transition-colors">
            Parking Occupancy Trends
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-medium transition-colors">
            Real data from Supabase • Total in view: <span className="font-bold text-neutral-800 dark:text-neutral-200">{totalPeriodParkings} parkings</span>
          </p>
        </div>

        {/* Time Range Tabs */}
        <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-full border border-neutral-200/60 dark:border-neutral-700 self-start sm:self-auto transition-colors">
          {timeTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setHoveredPoint(null);
              }}
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
        <div className="min-h-[32px] mb-3">
          {hoveredPoint ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 dark:bg-neutral-800 border border-neutral-800 dark:border-neutral-700 text-white text-xs shadow-soft-sm font-medium transition-all">
              <span className="font-bold">{hoveredPoint.time}</span>
              <span className="text-neutral-400">•</span>
              <span className="text-neutral-200 dark:text-neutral-300">{hoveredPoint.label}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800/60 text-neutral-500 dark:text-neutral-400 text-xs font-medium">
              <span>Hover over points to view exact entry counts</span>
            </div>
          )}
        </div>

        <div className="w-full h-56">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 600 220" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradientLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#111827" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#111827" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="chartGradientDark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.30" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            <line x1="40" y1="30" x2="560" y2="30" className="stroke-[#f0f2f5] dark:stroke-[#262626]" strokeDasharray="4 4" strokeWidth="1.5" />
            <line x1="40" y1="105" x2="560" y2="105" className="stroke-[#f0f2f5] dark:stroke-[#262626]" strokeDasharray="4 4" strokeWidth="1.5" />
            <line x1="40" y1="180" x2="560" y2="180" className="stroke-[#e5e7eb] dark:stroke-[#333333]" strokeWidth="1.5" />

            {/* Y Axis Labels */}
            <text x="25" y="34" className="fill-neutral-400 dark:fill-neutral-500 text-[11px] font-semibold" textAnchor="end">{maxCount}</text>
            <text x="25" y="109" className="fill-neutral-400 dark:fill-neutral-500 text-[11px] font-semibold" textAnchor="end">{Math.round(maxCount / 2)}</text>
            <text x="25" y="184" className="fill-neutral-400 dark:fill-neutral-500 text-[11px] font-semibold" textAnchor="end">0</text>

            {/* Area under curve */}
            <path d={areaD} className="fill-[url(#chartGradientLight)] dark:fill-[url(#chartGradientDark)] transition-all duration-300" />

            {/* Charcoal / Blue Line */}
            <path
              d={pathD}
              fill="none"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-neutral-900 dark:stroke-blue-400 transition-all duration-300"
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
                    r={isSelected ? "6" : "4.5"}
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
