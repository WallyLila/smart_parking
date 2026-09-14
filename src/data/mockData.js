export const initialParkingSlots = [
  {
    id: 1,
    name: "Parking Slot 01",
    status: "available",
    distance: 185,
    light: true,
    sensor: "online",
  },
  {
    id: 2,
    name: "Parking Slot 02",
    status: "occupied",
    distance: 42,
    light: false,
    sensor: "online",
  },
];

export const initialSystemStatus = [
  {
    id: 'esp32',
    name: 'ESP32',
    status: 'Online',
  },
  {
    id: 'sensor01',
    name: 'Ultrasonic Sensor 01',
    status: 'Online',
  },
  {
    id: 'sensor02',
    name: 'Ultrasonic Sensor 02',
    status: 'Online',
  },
  {
    id: 'lastUpdate',
    name: 'Last Update',
    status: 'Just now',
  },
];

export const initialActivities = [
  {
    id: 1,
    text: "Slot 01 became available",
    time: "2 min ago",
    status: "available",
  },
  {
    id: 2,
    text: "Slot 02 became occupied",
    time: "8 min ago",
    status: "occupied",
  },
  {
    id: 3,
    text: "Ultrasonic sensor updated",
    time: "12 min ago",
    status: "sensor",
  },
];

export const usageChartData = [
  { time: "12 AM", occupancy: 0, label: "0 Slots Occupied" },
  { time: "4 AM", occupancy: 0, label: "0 Slots Occupied" },
  { time: "8 AM", occupancy: 1, label: "1 Slot Occupied" },
  { time: "12 PM", occupancy: 1, label: "1 Slot Occupied", isHighlighted: true },
  { time: "4 PM", occupancy: 2, label: "2 Slots Occupied" },
  { time: "8 PM", occupancy: 1, label: "1 Slot Occupied" },
];

export const deviceList = [
  {
    id: 1,
    name: "Ultrasonic Sensor 01",
    status: "Online",
    updates: "1,248",
    lastUpdate: "Just now",
  },
  {
    id: 2,
    name: "Ultrasonic Sensor 02",
    status: "Online",
    updates: "1,192",
    lastUpdate: "Just now",
  },
  {
    id: 3,
    name: "ESP32 Controller",
    status: "Online",
    updates: "3,420",
    lastUpdate: "Just now",
  },
];
