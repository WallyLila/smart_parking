import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  RefreshCw, 
  Calendar, 
  Clock, 
  Car, 
  CheckCircle2, 
  Sliders, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  X,
  FileSpreadsheet
} from 'lucide-react';

/**
 * Format relative time (e.g. '2 นาทีที่แล้ว', '1 ชั่วโมงที่แล้ว')
 */
const formatRelativeTime = (isoString) => {
  if (!isoString) return 'เมื่อสักครู่';
  const now = new Date();
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return 'เมื่อสักครู่';
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'เมื่อสักครู่';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} นาทีที่แล้ว`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} ชั่วโมงที่แล้ว`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)} วันที่แล้ว`;
  return date.toLocaleDateString('th-TH');
};

/**
 * Format duration (seconds -> readable string)
 */
const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return null;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours} ชม. ${mins} นาที`;
  }
  if (mins > 0) {
    return `${mins} นาที ${secs} วิ`;
  }
  return `${secs} วินาที`;
};

/**
 * Export activities to UTF-8 CSV with BOM for Excel compatibility
 */
export const exportActivitiesToCSV = (items, filename = 'parking_activities.csv') => {
  if (!items || items.length === 0) {
    alert('ไม่มีข้อมูลสำหรับส่งออก (No data to export)');
    return;
  }

  const headers = ['ID', 'ช่องจอด (Slot)', 'เหตุการณ์ (Event)', 'สถานะ (Status)', 'วันที่ (Date)', 'เวลา (Time)', 'ระยะเวลาจอด (Duration)', 'ISO Timestamp'];

  const rows = items.map((item) => {
    const d = item.created_at ? new Date(item.created_at) : new Date();
    const dateStr = d.toLocaleDateString('th-TH');
    const timeStr = d.toLocaleTimeString('th-TH');
    const slotStr = item.slot_id ? `Slot 0${item.slot_id}` : '-';
    const textStr = `"${(item.text || '').replace(/"/g, '""')}"`;
    const statusStr = item.status || 'unknown';
    const durationStr = item.calculatedDuration ? `"${formatDuration(item.calculatedDuration)}"` : '-';
    const isoStr = item.created_at || d.toISOString();
    return [item.id, slotStr, textStr, statusStr, `"${dateStr}"`, `"${timeStr}"`, durationStr, `"${isoStr}"`].join(',');
  });

  // \uFEFF ensures UTF-8 BOM so Thai text displays perfectly in Microsoft Excel
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const ActivityTimeline = ({ activities = [], onRefresh, isLoading = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('all'); // 'all', '1', '2'
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all', 'occupied', 'available', 'sensor'
  const [dateRange, setDateRange] = useState('all'); // 'all', 'today', '7d', '30d'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Process activities with parking duration calculation
  const enrichedActivities = useMemo(() => {
    // Sort chronologically ascending to compute duration between occupied -> available
    const sorted = [...activities].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const occupiedAt = {};
    const durationMap = {};

    sorted.forEach((item) => {
      const slotId = item.slot_id || (item.text?.includes('01') ? 1 : item.text?.includes('02') ? 2 : null);
      if (!slotId) return;

      if (item.status === 'occupied') {
        occupiedAt[slotId] = new Date(item.created_at);
      } else if (item.status === 'available' && occupiedAt[slotId]) {
        const diffSec = Math.round((new Date(item.created_at) - occupiedAt[slotId]) / 1000);
        if (diffSec > 0 && diffSec < 86400) {
          durationMap[item.id] = diffSec;
        }
      }
    });

    // Return descending with calculated duration attached
    return [...activities]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map((item) => ({
        ...item,
        calculatedDuration: durationMap[item.id] || null,
      }));
  }, [activities]);

  // Filter activities based on Search, Slot, Status, and Date Range
  const filteredActivities = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return enrichedActivities.filter((item) => {
      // 1. Text Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const textMatch = item.text?.toLowerCase().includes(q);
        const statusMatch = item.status?.toLowerCase().includes(q);
        const slotMatch = `slot 0${item.slot_id}`.toLowerCase().includes(q) || `slot ${item.slot_id}`.toLowerCase().includes(q);
        if (!textMatch && !statusMatch && !slotMatch) return false;
      }

      // 2. Slot Filter
      if (selectedSlot !== 'all') {
        const itemSlot = item.slot_id || (item.text?.includes('01') ? 1 : item.text?.includes('02') ? 2 : null);
        if (String(itemSlot) !== String(selectedSlot)) return false;
      }

      // 3. Status Filter
      if (selectedStatus !== 'all') {
        if (item.status !== selectedStatus) return false;
      }

      // 4. Date Range Filter
      if (dateRange !== 'all') {
        const itemDate = new Date(item.created_at);
        if (dateRange === 'today' && itemDate < startOfToday) return false;
        if (dateRange === '7d' && itemDate < sevenDaysAgo) return false;
        if (dateRange === '30d' && itemDate < thirtyDaysAgo) return false;
      }

      return true;
    });
  }, [enrichedActivities, searchQuery, selectedSlot, selectedStatus, dateRange]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredActivities.length / itemsPerPage));
  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredActivities.slice(start, start + itemsPerPage);
  }, [filteredActivities, currentPage]);

  const handleExport = () => {
    const dateTag = new Date().toISOString().split('T')[0];
    exportActivitiesToCSV(filteredActivities, `smart_parking_activities_${dateTag}.csv`);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSlot('all');
    setSelectedStatus('all');
    setDateRange('all');
    setCurrentPage(1);
  };

  const isFiltering = searchQuery !== '' || selectedSlot !== 'all' || selectedStatus !== 'all' || dateRange !== 'all';

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-soft dark:shadow-none space-y-6 transition-colors duration-200">
      {/* Top Header: Title, Total Badge, Export & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white tracking-tight transition-colors">
              Activity History & Timeline
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200/70 dark:border-neutral-700">
              {filteredActivities.length} {filteredActivities.length === 1 ? 'record' : 'records'}
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium transition-colors">
            Comprehensive audit log of all car entries, exits, and sensor telemetry from Supabase
          </p>
        </div>

        {/* Action Buttons: Export CSV & Live Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-soft-sm transition-all duration-200 active:scale-95"
            title="Export filtered records to Microsoft Excel / CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-2xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700 text-xs font-semibold shadow-soft-sm transition-all duration-200 disabled:opacity-50 active:scale-95"
              title="Refresh latest data from Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Search Bar & Multi-filters */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by event, slot, or status (e.g. Slot 01, occupied)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-9 py-2 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Date Range Tabs */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-2xl border border-neutral-200/60 dark:border-neutral-700 self-start md:self-auto shrink-0">
            {[
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: '7d', label: 'Last 7 Days' },
              { id: '30d', label: 'Last 30 Days' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setDateRange(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  dateRange === tab.id
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Slot & Status Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* Slot Selector */}
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mr-1">Bay:</span>
            {[
              { id: 'all', label: 'All Bays' },
              { id: '1', label: 'Slot 01' },
              { id: '2', label: 'Slot 02' },
            ].map((slot) => (
              <button
                key={slot.id}
                onClick={() => {
                  setSelectedSlot(slot.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  selectedSlot === slot.id
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {slot.label}
              </button>
            ))}

            <div className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-700 mx-1" />

            {/* Status Selector */}
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mr-1">Status:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'occupied', label: 'Occupied (เข้าจอด)' },
              { id: 'available', label: 'Available (ว่าง/ออก)' },
              { id: 'sensor', label: 'Sensor (ฮาร์ดแวร์)' },
            ].map((status) => (
              <button
                key={status.id}
                onClick={() => {
                  setSelectedStatus(status.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  selectedStatus === status.id
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>

          {/* Reset Filters Link */}
          {isFiltering && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 dark:text-rose-400 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Timeline Feed Container */}
      <div className="relative pt-2">
        {paginatedActivities.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 mx-auto flex items-center justify-center text-neutral-400">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
              No matching activity found
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
              There are no parking log entries matching your current search query or filter selection.
            </p>
            {isFiltering && (
              <button
                onClick={handleResetFilters}
                className="mt-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-[2px] before:bg-neutral-200 dark:before:bg-neutral-800 space-y-4">
            {paginatedActivities.map((activity) => {
              const isOccupied = activity.status === 'occupied';
              const isAvailable = activity.status === 'available';
              const isSensor = activity.status === 'sensor';
              const slotId = activity.slot_id || (activity.text?.includes('01') ? 1 : activity.text?.includes('02') ? 2 : 1);
              const rawDate = activity.created_at ? new Date(activity.created_at) : new Date();
              const createdAt = !isNaN(rawDate.getTime()) ? rawDate : new Date();

              return (
                <div key={activity.id} className="relative group">
                  {/* Timeline Node Dot */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-3 w-3 h-3 rounded-full border-2 border-white dark:border-neutral-900 transition-transform group-hover:scale-125 ${
                      isOccupied
                        ? 'bg-rose-500 shadow-sm'
                        : isAvailable
                        ? 'bg-emerald-500 shadow-sm'
                        : 'bg-sky-500 shadow-sm'
                    }`}
                  />

                  {/* Activity Card */}
                  <div className="bg-neutral-50/70 dark:bg-neutral-800/50 hover:bg-neutral-100/70 dark:hover:bg-neutral-800 border border-neutral-200/70 dark:border-neutral-700/60 rounded-2xl p-4 transition-all duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      {/* Left: Badge & Description */}
                      <div className="flex items-start sm:items-center gap-3">
                        {/* Status Icon */}
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isOccupied
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                              : isAvailable
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                              : 'bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400'
                          }`}
                        >
                          {isOccupied ? (
                            <ArrowDownRight className="w-4 h-4" />
                          ) : isAvailable ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <Sliders className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                                slotId === 1
                                  ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                              }`}
                            >
                              Slot 0{slotId}
                            </span>

                            <span
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                                isOccupied
                                  ? 'bg-rose-100/80 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                                  : isAvailable
                                  ? 'bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-sky-100/80 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300'
                              }`}
                            >
                              {isOccupied ? 'Occupied (เข้าจอด)' : isAvailable ? 'Available (ว่าง/ออก)' : 'Telemetry (เซนเซอร์)'}
                            </span>

                            {/* Duration chip if available */}
                            {activity.calculatedDuration && (
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5 text-neutral-500" />
                                <span>จอดนาน {formatDuration(activity.calculatedDuration)}</span>
                              </span>
                            )}
                          </div>

                          <p className="text-xs font-semibold text-neutral-900 dark:text-white mt-1">
                            {activity.text}
                          </p>
                        </div>
                      </div>

                      {/* Right: Date & Time Info */}
                      <div className="text-right sm:self-center shrink-0 pl-12 sm:pl-0">
                        <span className="text-xs font-bold text-neutral-900 dark:text-white font-mono block">
                          {createdAt.toLocaleTimeString('th-TH')}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 font-medium">
                          <span>{createdAt.toLocaleDateString('th-TH')}</span>
                          <span>•</span>
                          <span>{formatRelativeTime(activity.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {filteredActivities.length > itemsPerPage && (
          <div className="flex items-center justify-between pt-6 border-t border-neutral-100 dark:border-neutral-800 text-xs">
            <span className="text-neutral-500 dark:text-neutral-400 font-medium">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredActivities.length)} of{' '}
              {filteredActivities.length} entries
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 font-bold text-neutral-900 dark:text-white">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
