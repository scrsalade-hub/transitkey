import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// Smooth curved path generator - creates realistic road-like curves between stops
function generateSmoothPath(stops) {
  if (!stops || stops.length === 0) return [];
  const n = stops.length;
  const points = [];
  // Create a realistic winding route
  for (let i = 0; i < n; i++) {
    const t = i / Math.max(n - 1, 1);
    // Winding S-curve with some randomness
    const x = 8 + t * 84;
    const wobble = Math.sin(t * Math.PI * 3) * 8 + Math.sin(t * Math.PI * 7) * 3;
    const y = 20 + t * 55 + wobble;
    points.push([Math.max(3, Math.min(97, x)), Math.max(5, Math.min(85, y))]);
  }
  // Interpolate for smoothness
  const smooth = [];
  for (let i = 0; i < points.length - 1; i++) {
    smooth.push(points[i]);
    // Add midpoint
    smooth.push([
      (points[i][0] + points[i+1][0]) / 2 + (Math.random() - 0.5) * 2,
      (points[i][1] + points[i+1][1]) / 2 + (Math.random() - 0.5) * 2
    ]);
  }
  smooth.push(points[points.length - 1]);
  return smooth;
}

function pathToSvgD(path) {
  if (!path.length) return '';
  let d = `M ${path[0][0].toFixed(1)} ${path[0][1].toFixed(1)}`;
  for (let i = 1; i < path.length; i++) d += ` L ${path[i][0].toFixed(1)} ${path[i][1].toFixed(1)}`;
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
  return [
    p1[0] + (p2[0] - p1[0]) * frac,
    p1[1] + (p2[1] - p1[1]) * frac
  ];
}

// Get angle of the path at a given progress (for bus rotation)
function getAngleAtProgress(path, progress) {
  const p1 = getPointAtProgress(path, Math.max(0, progress - 0.005));
  const p2 = getPointAtProgress(path, Math.min(1, progress + 0.005));
  return Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * 180 / Math.PI;
}

function formatTime(mins) {
  if (mins <= 0) return 'Arriving now';
  if (mins < 1) return '1 min';
  if (mins < 60) return `${Math.ceil(mins)} min`;
  const h = Math.floor(mins / 60);
  const m = Math.ceil(mins % 60);
  return `${h}h ${m}m`;
}

export default function RealMap({
  stops = [],
  currentStopIndex = 0,
  delayMinutes = 0,
  busId = '',
  driverName = '',
  estimatedDuration = 120,
  onMarkStopArrived,
  onReportDelay,
  paused = false
}) {
  const [simulationSpeed, setSimulationSpeed] = useState(1); // 1x, 5x, 10x, 20x
  const animRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const lastDepartedRef = useRef(currentStopIndex);

  // Generate the route path
  const routePath = useMemo(() => generateSmoothPath(stops), [stops]);

  // Calculate progress based on time
  const [busProgress, setBusProgress] = useState(() => {
    if (stops.length <= 1) return 0;
    return currentStopIndex / Math.max(stops.length - 1, 1);
  });

  // Update internal progress when prop changes
  useEffect(() => {
    if (stops.length > 1) {
      setBusProgress(currentStopIndex / (stops.length - 1));
    }
  }, [currentStopIndex, stops.length]);

  // Auto-simulate movement between stops
  useEffect(() => {
    if (paused || !stops.length || currentStopIndex >= stops.length - 1) return;
    startTimeRef.current = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsedReal = (now - startTimeRef.current) / 1000; // seconds
      const elapsedSimulated = elapsedReal * simulationSpeed; // simulated seconds

      // Time between stops = estimatedDuration / (num_stops - 1) in minutes
      const timeBetweenStops = (estimatedDuration / Math.max(stops.length - 1, 1)) * 60; // seconds
      const progressPerStop = 1 / Math.max(stops.length - 1, 1);

      const currentStopStart = currentStopIndex * progressPerStop;
      const nextStopEnd = (currentStopIndex + 1) * progressPerStop;

      const frac = Math.min(elapsedSimulated / timeBetweenStops, 1);
      const newProgress = currentStopStart + frac * (nextStopEnd - currentStopStart);

      setBusProgress(newProgress);

      if (frac < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [currentStopIndex, stops.length, estimatedDuration, simulationSpeed, paused]);

  const busPos = getPointAtProgress(routePath, busProgress);
  const busAngle = getAngleAtProgress(routePath, busProgress);

  // Completed path (trail behind bus)
  const completedPathD = useMemo(() => {
    if (!routePath.length) return '';
    const trailIndex = Math.floor(busProgress * (routePath.length - 1));
    return pathToSvgD(routePath.slice(0, trailIndex + 1));
  }, [routePath, busProgress]);

  // Remaining path (ahead of bus)
  const remainingPathD = useMemo(() => {
    if (!routePath.length) return '';
    const headIndex = Math.floor(busProgress * (routePath.length - 1));
    return pathToSvgD(routePath.slice(headIndex));
  }, [routePath, busProgress]);

  // ETA calculation
  const nextStopEta = useMemo(() => {
    if (currentStopIndex >= stops.length - 1) return 0;
    const timePerStop = estimatedDuration / Math.max(stops.length - 1, 1);
    const remainingInSegment = 1 - (busProgress * (stops.length - 1) - currentStopIndex);
    return remainingInSegment * timePerStop + delayMinutes;
  }, [busProgress, currentStopIndex, stops.length, estimatedDuration, delayMinutes]);

  // Final destination ETA
  const finalEta = useMemo(() => {
    if (currentStopIndex >= stops.length) return 0;
    const remainingStops = stops.length - 1 - currentStopIndex;
    const timePerStop = estimatedDuration / Math.max(stops.length - 1, 1);
    return remainingStops * timePerStop + delayMinutes;
  }, [currentStopIndex, stops.length, estimatedDuration, delayMinutes]);

  const svgD = pathToSvgD(routePath);

  return (
    <div className="w-full select-none">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-3 items-center">
        <span className="text-xs text-gray-500 uppercase font-medium">Speed:</span>
        {[1, 5, 10, 20].map(speed => (
          <button
            key={speed}
            onClick={() => { startTimeRef.current = Date.now(); setSimulationSpeed(speed); }}
            className={`px-3 py-1 text-xs font-medium transition-colors ${simulationSpeed === speed ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
          >
            {speed}x
          </button>
        ))}
        <span className="text-xs text-gray-500 ml-auto">
          {currentStopIndex >= stops.length - 1 ? 'Route Complete' : `Next stop: ${formatTime(nextStopEta)}`}
        </span>
      </div>

      {/* Map */}
      <div className="relative bg-[#f0ede8] border border-gray-300 overflow-hidden rounded-sm" style={{ minHeight: '450px' }}>
        <svg viewBox="0 0 100 90" className="w-full" preserveAspectRatio="xMidYMid meet" style={{ minHeight: '450px' }}>
          {/* Background grid */}
          <rect x="0" y="0" width="100" height="90" fill="#f5f3ef" />
          {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(n => (
            <g key={n} opacity="0.15">
              <line x1={n} y1="0" x2={n} y2="90" stroke="#ccc" strokeWidth="0.1" />
              <line x1="0" y1={n} x2="100" y2={n} stroke="#ccc" strokeWidth="0.1" />
            </g>
          ))}

          {/* Area background - urban blocks */}
          <rect x="5" y="5" width="15" height="12" fill="#e8e4de" rx="1" />
          <rect x="25" y="60" width="12" height="10" fill="#e8e4de" rx="1" />
          <rect x="55" y="15" width="10" height="8" fill="#e8e4de" rx="1" />
          <rect x="75" y="55" width="15" height="12" fill="#e8e4de" rx="1" />
          <rect x="40" y="72" width="14" height="10" fill="#e8e4de" rx="1" />

          {/* Water/river */}
          <path d="M 0 35 Q 20 30, 40 38 T 80 32 T 100 36" fill="none" stroke="#b8d4e3" strokeWidth="3" opacity="0.5" />

          {/* Road shadow */}
          {svgD && <path d={svgD} fill="none" stroke="#d1cec7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

          {/* Completed road portion - dark green like Google Maps */}
          {completedPathD && <path d={completedPathD} fill="none" stroke="#34a853" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />}

          {/* Remaining road - gray */}
          {remainingPathD && <path d={remainingPathD} fill="none" stroke="#b0b0b0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2,1" />}

          {/* Stop markers */}
          {stops.map((stop, i) => {
            const pos = routePath[Math.min(i * 2, routePath.length - 1)];
            if (!pos) return null;
            const isCompleted = i < currentStopIndex;
            const isCurrent = i === currentStopIndex;
            const isUpcoming = i > currentStopIndex;

            return (
              <g key={i}>
                {/* Stop circle */}
                <circle cx={pos[0]} cy={pos[1]} r={isCurrent ? 1.8 : 1.2}
                  fill={isCompleted ? '#34a853' : isCurrent ? '#4285f4' : '#fff'}
                  stroke={isCompleted ? '#2e7d32' : isCurrent ? '#1a73e8' : '#888'}
                  strokeWidth="0.3" />
                {/* Pulse ring for current stop */}
                {isCurrent && (
                  <circle cx={pos[0]} cy={pos[1]} r="3" fill="none" stroke="#4285f4" strokeWidth="0.2" opacity="0.4">
                    <animate attributeName="r" values="2.5;4.5;2.5" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Stop label */}
                <text x={pos[0]} y={pos[1] - (isCurrent ? 3 : 2.5)} textAnchor="middle" fontSize={isCurrent ? '2.2' : '1.8'} fill="#1a1a1a" fontWeight={isCurrent ? '700' : '500'} style={{ textShadow: '0 0 2px #fff, 0 0 4px #fff' }}>
                  {stop.name}
                </text>
              </g>
            );
          })}

          {/* Bus icon - realistic with rotation */}
          {busPos && (
            <g transform={`translate(${busPos[0]}, ${busPos[1]}) rotate(${busAngle})`}>
              {/* Shadow */}
              <circle r="2.8" fill="#000" opacity="0.1" cx="0.3" cy="0.3" />
              {/* Outer glow */}
              <circle r="2.5" fill="#fbbf24" opacity="0.15">
                <animate attributeName="r" values="2.5;3.2;2.5" dur="1.5s" repeatCount="indefinite" />
              </circle>
              {/* Bus body */}
              <rect x="-2.2" y="-1.3" width="4.4" height="2.6" rx="0.6" fill="#f59e0b" stroke="#b45309" strokeWidth="0.2" />
              {/* Windows */}
              <rect x="-1.7" y="-0.9" width="1.1" height="0.8" rx="0.2" fill="#93c5fd" />
              <rect x="0.2" y="-0.9" width="1.6" height="0.8" rx="0.2" fill="#93c5fd" />
              {/* Headlight */}
              <rect x="2" y="0.3" width="0.3" height="0.3" rx="0.1" fill="#fef3c7" />
              {/* Plate text */}
              <text x="0" y="0.9" textAnchor="middle" fontSize="1" fill="#78350f" fontWeight="700">{busId.slice(0, 8)}</text>
            </g>
          )}

          {/* North indicator */}
          <g transform="translate(92, 7)">
            <circle r="2.5" fill="white" stroke="#ccc" strokeWidth="0.2" />
            <text y="-0.6" textAnchor="middle" fontSize="1.4" fill="#e74c3c" fontWeight="700">N</text>
          </g>

          {/* Legend */}
          <g transform="translate(5, 6)">
            <rect x="-1.5" y="-3" width="26" height="14" rx="1" fill="white" stroke="#ddd" strokeWidth="0.15" opacity="0.95" />
            <circle cx="2" cy="-0.5" r="0.8" fill="#34a853" /><text x="3.8" y="0.1" fontSize="1.5" fill="#333">Done</text>
            <circle cx="11" cy="-0.5" r="0.8" fill="#4285f4" /><text x="12.8" y="0.1" fontSize="1.5" fill="#333">Current</text>
            <circle cx="2" cy="4.5" r="0.8" fill="white" stroke="#888" strokeWidth="0.25" /><text x="3.8" y="5.1" fontSize="1.5" fill="#333">Ahead</text>
            <rect x="11" y="3.8" width="2.5" height="1" rx="0.2" fill="#f59e0b" stroke="#b45309" strokeWidth="0.15" /><text x="14.3" y="5.1" fontSize="1.5" fill="#333">Bus</text>
          </g>
        </svg>

        {/* Status overlay */}
        <div className="absolute top-3 left-3">
          <div className="bg-gray-900 text-white text-xs px-3 py-1.5 flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span>LIVE TRACKING</span>
            {simulationSpeed > 1 && <span className="text-yellow-400">({simulationSpeed}x)</span>}
            {delayMinutes > 0 && <span className="text-red-400">+{delayMinutes}m</span>}
          </div>
        </div>

        {/* Next stop info */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-white border border-gray-200 px-3 py-2 shadow-md text-xs">
            <span className="text-gray-500">Next: </span>
            <span className="font-semibold">{stops[currentStopIndex]?.name || 'Destination'}</span>
            <span className="text-gray-400 mx-1">|</span>
            <span className="text-blue-600 font-medium">{formatTime(nextStopEta)}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {onReportDelay && (
            <button onClick={onReportDelay} className="bg-red-600 text-white text-xs px-3 py-1.5 shadow-md flex items-center gap-1 hover:bg-red-700 transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Delay
            </button>
          )}
          {onMarkStopArrived && currentStopIndex < stops.length - 1 && (
            <button onClick={onMarkStopArrived} className="bg-blue-600 text-white text-xs px-3 py-1.5 shadow-md flex items-center gap-1 hover:bg-blue-700 transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Arrived
            </button>
          )}
        </div>
      </div>

      {/* Stop progress timeline */}
      {stops.length > 0 && (
        <div className="bg-white border border-gray-300 mt-3 p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-medium text-gray-500 uppercase">Trip Progress</h3>
            <span className="text-xs text-gray-500">{currentStopIndex}/{stops.length - 1} stops</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${Math.min((currentStopIndex / Math.max(stops.length - 1, 1)) * 100, 100)}%` }} />
          </div>

          {/* Stop cards */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {stops.map((stop, i) => {
              const isCompleted = i < currentStopIndex;
              const isCurrent = i === currentStopIndex;
              const isUpcoming = i > currentStopIndex;
              return (
                <div key={i} className={`flex-shrink-0 p-3 border min-w-[140px] ${isCompleted ? 'border-green-300 bg-green-50' : isCurrent ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className={`w-2.5 h-2.5 rounded-full ${isCompleted ? 'bg-green-500' : isCurrent ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`} />
                    <span className={`text-xs font-semibold ${isCurrent ? 'text-blue-700' : 'text-gray-700'}`}>
                      {isCompleted ? 'Done' : isCurrent ? 'Now' : `+${i - currentStopIndex}`}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate">{stop.name}</p>
                  <p className="text-xs text-gray-500">
                    {isCompleted ? 'Completed' : isCurrent ? 'Approaching' : stop.estimatedArrival || '--'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
        <div className="bg-white border border-gray-200 p-3 text-center">
          <p className="text-xs text-gray-500 uppercase">Next Stop</p>
          <p className="text-sm font-bold mt-1">{formatTime(nextStopEta)}</p>
        </div>
        <div className="bg-white border border-gray-200 p-3 text-center">
          <p className="text-xs text-gray-500 uppercase">To Destination</p>
          <p className="text-sm font-bold mt-1">{formatTime(finalEta)}</p>
        </div>
        <div className="bg-white border border-gray-200 p-3 text-center">
          <p className="text-xs text-gray-500 uppercase">Driver</p>
          <p className="text-sm font-medium mt-1 truncate">{driverName || '--'}</p>
        </div>
        <div className="bg-white border border-gray-200 p-3 text-center">
          <p className="text-xs text-gray-500 uppercase">Bus</p>
          <p className="text-sm font-medium mt-1 truncate">{busId || '--'}</p>
        </div>
      </div>
    </div>
  );
}
