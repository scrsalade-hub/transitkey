// Unified localStorage data store - shared across all 3 dashboards
const STORE_KEY = 'transitkey_store';

function getStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : { drivers: [], routes: [], trips: [], notifications: [], complaints: [] };
  } catch { return { drivers: [], routes: [], trips: [], notifications: [], complaints: [] }; }
}

function setStore(store) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export const localStore = {
  getDrivers() { return getStore().drivers; },
  getDriverById(id) { return getStore().drivers.find(d => d._id === id || d.driverId === id); },
  getDriverByToken(token) { return getStore().drivers.find(d => d.accessToken === token); },
  addDriver(driver) {
    const store = getStore();
    const d = { ...driver, _id: driver._id || 'dr_' + Date.now(), createdAt: new Date().toISOString() };
    store.drivers.push(d);
    setStore(store);
    return d;
  },
  updateDriver(id, updates) {
    const store = getStore();
    const idx = store.drivers.findIndex(d => d._id === id);
    if (idx >= 0) { store.drivers[idx] = { ...store.drivers[idx], ...updates }; setStore(store); return store.drivers[idx]; }
    return null;
  },

  getRoutes() { return getStore().routes; },
  getRouteById(id) { return getStore().routes.find(r => r._id === id); },
  addRoute(route) {
    const store = getStore();
    const r = { ...route, _id: route._id || 'rt_' + Date.now(), status: 'active', createdAt: new Date().toISOString() };
    store.routes.push(r);
    setStore(store);
    return r;
  },

  getTrips() { return getStore().trips; },
  getActiveTripForDriver(driverId) {
    return getStore().trips.find(t =>
      (t.driverId === driverId || t.driver?._id === driverId) && t.status === 'in_progress'
    );
  },
  addTrip(trip) {
    const store = getStore();
    const t = { ...trip, _id: trip._id || 'tr_' + Date.now(), currentStopIndex: 0, delayMinutes: 0, startedAt: new Date().toISOString(), createdAt: new Date().toISOString() };
    store.trips.push(t);
    setStore(store);
    return t;
  },
  updateTrip(id, updates) {
    const store = getStore();
    const idx = store.trips.findIndex(t => t._id === id);
    if (idx >= 0) { store.trips[idx] = { ...store.trips[idx], ...updates }; setStore(store); return store.trips[idx]; }
    return null;
  },

  getComplaints() { return getStore().complaints; },
  addComplaint(complaint) {
    const store = getStore();
    const c = { ...complaint, _id: complaint._id || 'cp_' + Date.now(), status: 'open', createdAt: new Date().toISOString() };
    store.complaints.unshift(c);
    // Add notification for operators
    store.notifications.unshift({
      _id: 'nt_' + Date.now(), type: 'complaint',
      title: `New ${complaint.reporterRole || ''} Complaint: ${complaint.category}`,
      message: complaint.description?.slice(0, 120) || 'New complaint received',
      targetRole: 'operator', createdAt: new Date().toISOString(), read: false,
    });
    setStore(store);
    return c;
  },
  updateComplaint(id, updates) {
    const store = getStore();
    const idx = store.complaints.findIndex(c => c._id === id);
    if (idx >= 0) { store.complaints[idx] = { ...store.complaints[idx], ...updates }; setStore(store); }
  },

  getNotifications() { return getStore().notifications; },
  addNotification(n) {
    const store = getStore();
    store.notifications.unshift({ ...n, _id: 'nt_' + Date.now(), createdAt: new Date().toISOString(), read: false });
    setStore(store);
  },
  markAllRead() {
    const store = getStore();
    store.notifications.forEach(n => n.read = true);
    setStore(store);
  },

  clear() { localStorage.removeItem(STORE_KEY); }
};

// Seed demo data - adds route, trip, notification. Only adds demo driver if no drivers exist.
export function seedInitialData() {
  const store = getStore();

  // Only seed if we have no routes or no trips
  const hasRoutes = store.routes.length > 0;
  const hasTrips = store.trips.length > 0;

  if (!hasRoutes) {
    store.routes.push({
      _id: 'rt_demo_001', name: 'Oshodi - CMS Express', routeId: 'RTE-001',
      startTerminal: 'Oshodi Bus Terminal', endTerminal: 'CMS Terminal',
      distance: 18, estimatedDuration: 90, fare: 500, status: 'active',
      stops: [
        { name: 'Oshodi Bus Terminal', estimatedArrival: '08:00 AM', durationFromStart: 0 },
        { name: 'Anthony Bus Stop', estimatedArrival: '08:20 AM', durationFromStart: 20 },
        { name: 'Maryland Junction', estimatedArrival: '08:45 AM', durationFromStart: 45 },
        { name: 'Ojota Interchange', estimatedArrival: '09:10 AM', durationFromStart: 70 },
        { name: 'Costain Roundabout', estimatedArrival: '09:35 AM', durationFromStart: 95 },
        { name: 'CMS Terminal', estimatedArrival: '10:00 AM', durationFromStart: 120 },
      ],
    });
  }

  if (!hasTrips) {
    store.trips.push({
      _id: 'tr_demo_001', routeId: 'rt_demo_001',
      route: store.routes[0] || { _id: 'rt_demo_001', name: 'Oshodi - CMS Express', startTerminal: 'Oshodi Bus Terminal', endTerminal: 'CMS Terminal', estimatedDuration: 90, stops: [] },
      driverId: 'dr_demo_001',
      driver: { _id: 'dr_demo_001', fullName: 'Adewale Musa', plateNumber: 'LAG-9901-B' },
      bus: { _id: 'bus_001', plateNumber: 'LAG-9901-B', model: 'BRT Bus', type: 'BRT' },
      tripId: 'TRIP-001', status: 'in_progress',
      currentStopIndex: 0, delayMinutes: 0,
      startedAt: new Date().toISOString(), stopDepartures: [],
    });

    store.notifications.push({
      _id: 'nt_demo_001', type: 'route_update', title: 'Trip Assigned',
      message: 'You have been assigned to Oshodi - CMS Express. Bus: LAG-9901-B. Departure: 08:00 AM.',
      targetRole: 'driver', createdAt: new Date().toISOString(), read: false,
    });
  }

  // Only add demo driver if no drivers exist yet
  if (store.drivers.length === 0) {
    store.drivers.push({
      _id: 'dr_demo_001', fullName: 'Adewale Musa', phoneNumber: '+2348012345678',
      email: 'driver@transitkey.com', plateNumber: 'LAG-9901-B', busType: 'BRT',
      licenseNumber: 'LIC-2024-001', licenseType: 'Commercial Driver License',
      vehicleClass: 'Class B', yearsOfExperience: 5, driverId: 'TMS-DR-0001',
      accessToken: 'TKD-DEMO-driver-001', status: 'active', standing: 'good standing',
      operatorId: 'op_demo', role: 'driver',
    });
  }

  setStore(store);
}
