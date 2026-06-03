import { useMemo } from 'react';

function pathToSvgD(path) {
  if (!path || !path.length) return '';
  let d = `M ${path[0][0]} ${path[0][1]}`;
  for (let i = 1; i < path.length; i++) d += ` L ${path[i][0]} ${path[i][1]}`;
  return d;
}

function getPointAtProgress(path, progress) {
  if (!path || !path.length) return [50, 50];
  const totalSegments = path.length - 1;
  const exactIndex = progress * totalSegments;
  const index = Math.floor(exactIndex);
  const frac = exactIndex - index;
  if (index >= totalSegments) return path[path.length - 1];
  const p1 = path[index], p2 = path[index + 1];
  return [p1[0] + (p2[0] - p1[0]) * frac, p1[1] + (p2[1] - p1[1]) * frac];
}

function formatTime(dateStr) {
  if (!dateStr) return '--:--';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function addMinutesToTime(timeStr, minutes) {
  if (!timeStr) return '--:--';
  const d = new Date(timeStr);
  d.setMinutes(d.getMinutes() + (minutes || 0));
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function LiveMap({
  routePath = [],
  stops = [],
  currentStopIndex = 0,
  busProgress = 0,
  delayMinutes = 0,
  busId = '',
  driverName = '',
  onMarkStopArrived,
  onReportDelay
}) {
  const svgD = useMemo(() => pathToSvgD(routePath), [routePath]);
  const busPos = useMemo(() => getPointAtProgress(routePath, busProgress), [routePath, busProgress]);

  // Completed path (up through current stop)
  const completedPathD = useMemo(() => {
    if (currentStopIndex < 0 || !routePath.length || !stops.length) return '';
    const stopIdx = stops[Math.min(currentStopIndex, stops.length - 1)]?.pathIndex || 0;
    return pathToSvgD(routePath.slice(0, stopIdx + 1));
  }, [routePath, stops, currentStopIndex]);

  const getETA = (stopIdx) => {
    const stop = stops[stopIdx];
    if (!stop) return '';
    if (stopIdx < currentStopIndex) return 'Arrived';
    if (stopIdx === currentStopIndex) return `ETA: ${addMinutesToTime(stop.estimatedArrival, delayMinutes)}`;
    return `ETA: ${addMinutesToTime(stop.estimatedArrival, delayMinutes)}`;
  };

  return (
    <div className="w-full">
      {/* Map */}
      <div className="relative bg-[#e8e6e1] border border-gray-300 overflow-hidden" style={{ minHeight: '400px' }}>
        <svg viewBox="0 0 100 90" className="w-full" preserveAspectRatio="xMidYMid meet" style={{ minHeight: '400px' }}>
          <rect x="0" y="0" width="100" height="90" fill="#f0ede8" />
          {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(n => (
            <g key={n}>
              <line x1={n} y1="0" x2={n} y2="90" stroke="#ddd" strokeWidth="0.15" />
              <line x1="0" y1={n} x2="100" y2={n} stroke="#ddd" strokeWidth="0.15" />
            </g>
          ))}

          {/* Completed route portion */}
          {completedPathD && (
            <path d={completedPathD} fill="none" stroke="#10b981" strokeWidth="0.8" strokeLinecap="round" />
          )}

          {/* Full route (remaining) */}
          {svgD && (
            <path d={svgD} fill="none" stroke="#3b82f6" strokeWidth="0.6" strokeDasharray="1.5,0.8" strokeLinecap="round" opacity="0.7" />
          )}

          {/* Stop markers */}
          {stops.map((stop, i) => {
            const pos = routePath[stop.pathIndex];
            if (!pos) return null;
            const isCompleted = i < currentStopIndex;
            const isCurrent = i === currentStopIndex;
            const isUpcoming = i > currentStopIndex;
            let fillColor = '#9ca3af', strokeColor = '#6b7280', radius = '1.2';
            if (isCompleted) { fillColor = '#10b981'; strokeColor = '#059669'; }
            if (isCurrent) { fillColor = '#3b82f6'; strokeColor = '#2563eb'; radius = '1.6'; }
            if (isUpcoming) { fillColor = '#fff'; strokeColor = '#6b7280'; }
            return (
              <g key={i}>
                <circle cx={pos[0]} cy={pos[1]} r={radius} fill={fillColor} stroke={strokeColor} strokeWidth="0.3" />
                {isCurrent && (
                  <circle cx={pos[0]} cy={pos[1]} r="2.5" fill="none" stroke="#3b82f6" strokeWidth="0.2" opacity="0.5">
                    <animate attributeName="r" values="2;3.5;2" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <text x={pos[0]} y={pos[1] - 2.5} textAnchor="middle" fontSize="1.8" fill="#374151" fontWeight={isCurrent ? '700' : '400'}>{stop.name}</text>
                <text x={pos[0]} y={pos[1] + 3.5} textAnchor="middle" fontSize="1.4" fill="#6b7280">
                  {isCompleted ? `Departed ${formatTime(stop.departedAt)}` :
                   isCurrent ? getETA(i) :
                   getETA(i)}
                </text>
              </g>
            );
          })}

          {/* Moving bus */}
          {busPos && (
            <g transform={`translate(${busPos[0]}, ${busPos[1]})`}>
              <circle r="3" fill="#fbbf24" opacity="0.2">
                <animate attributeName="r" values="2.5;4;2.5" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <rect x="-2" y="-1.2" width="4" height="2.4" rx="0.5" fill="#f59e0b" stroke="#b45309" strokeWidth="0.2" />
              <rect x="-1.5" y="-0.8" width="1" height="0.8" rx="0.2" fill="#dbeafe" />
              <rect x="0.2" y="-0.8" width="1.3" height="0.8" rx="0.2" fill="#dbeafe" />
              <text y="-1.8" textAnchor="middle" fontSize="1.6" fill="#1e40af" fontWeight="700">{busId}</text>
            </g>
          )}

          {/* Legend */}
          <g transform="translate(5, 8)">
            <rect x="-2" y="-4" width="30" height="14" rx="1" fill="white" stroke="#d1d5db" strokeWidth="0.2" opacity="0.95" />
            <circle cx="2" cy="-0.5" r="1" fill="#10b981" /><text x="4.5" y="0.2" fontSize="1.6" fill="#374151">Completed</text>
            <circle cx="13" cy="-0.5" r="1" fill="#3b82f6" /><text x="15.5" y="0.2" fontSize="1.6" fill="#374151">Current</text>
            <circle cx="2" cy="4" r="1" fill="white" stroke="#6b7280" strokeWidth="0.3" /><text x="4.5" y="4.7" fontSize="1.6" fill="#374151">Upcoming</text>
            <rect x="12" y="3.2" width="3" height="1.2" rx="0.3" fill="#f59e0b" stroke="#b45309" strokeWidth="0.15" /><text x="16.5" y="4.7" fontSize="1.6" fill="#374151">Bus</text>
          </g>
        </svg>

        {/* Overlay */}
        <div className="absolute top-3 left-3">
          <span className="bg-gray-800 text-white text-xs px-3 py-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            LIVE{delayMinutes > 0 ? ` (+${delayMinutes}min delay)` : ''}
          </span>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="bg-white border border-gray-300 text-xs px-3 py-1.5">
            {stops[currentStopIndex] ? `Next: ${stops[currentStopIndex].name}` : 'Route Complete'}
          </span>
        </div>
        {onReportDelay && (
          <div className="absolute top-3 right-3">
            <button onClick={onReportDelay} className="bg-red-600 text-white text-xs px-3 py-1.5 flex items-center gap-1 hover:bg-red-700 transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Report Delay
            </button>
          </div>
        )}
      </div>

      {/* Stop Timeline */}
      {stops.length > 0 && (
        <div className="bg-white border border-gray-300 mt-4 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Trip Progress</h3>
            <div className="flex gap-2">
              {onReportDelay && (
                <button onClick={onReportDelay} className="border border-red-400 text-red-600 px-3 py-1.5 text-xs hover:bg-red-50 transition-colors">
                  + Add Delay
                </button>
              )}
              {onMarkStopArrived && currentStopIndex < stops.length && (
                <button onClick={onMarkStopArrived} className="bg-blue-600 text-white px-4 py-1.5 text-xs font-medium hover:bg-blue-700 transition-colors">
                  Mark {stops[currentStopIndex]?.name || 'Stop'} Arrived
                </button>
              )}
            </div>
          </div>
          <div className="relative">
            <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div className="space-y-4">
              {stops.map((stop, i) => {
                const isCompleted = i < currentStopIndex;
                const isCurrent = i === currentStopIndex;
                return (
                  <div key={i} className="flex items-start gap-3 relative">
                    <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 border-2 z-10 ${isCompleted ? 'bg-green-500 border-green-500' : isCurrent ? 'bg-blue-500 border-blue-500 animate-pulse' : 'bg-white border-gray-300'}`}></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={`text-sm font-medium ${isCompleted ? 'text-green-700 line-through' : isCurrent ? 'text-blue-700' : 'text-gray-900'}`}>
                            {stop.name}
                          </p>
                          {isCurrent && stops[i + 1] && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              Next: {stops[i + 1].name} at {addMinutesToTime(stops[i + 1].estimatedArrival, delayMinutes)}
                            </p>
                          )}
                        </div>
                        <span className={`text-xs ${isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                          {isCompleted ? formatTime(stop.departedAt) :
                           isCurrent ? `ETA ${addMinutesToTime(stop.estimatedArrival, delayMinutes)}` :
                           addMinutesToTime(stop.estimatedArrival, delayMinutes)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="bg-white border border-gray-300 p-4">
          <p className="text-xs text-gray-500 uppercase">Current Stop</p>
          <p className="text-lg font-bold mt-1">{stops[currentStopIndex]?.name || 'Complete'}</p>
          {delayMinutes > 0 && <p className="text-xs text-red-600 mt-1">+{delayMinutes} min delay</p>}
        </div>
        <div className="bg-white border border-gray-300 p-4">
          <p className="text-xs text-gray-500 uppercase">Driver</p>
          <p className="text-sm font-medium mt-1">{driverName || '--'}</p>
        </div>
        <div className="bg-white border border-gray-300 p-4">
          <p className="text-xs text-gray-500 uppercase">Bus</p>
          <p className="text-sm font-medium mt-1">{busId || '--'}</p>
        </div>
      </div>
    </div>
  );
}
