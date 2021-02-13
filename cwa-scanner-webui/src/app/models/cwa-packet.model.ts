export interface AggregationPacket<T> {
  filename: string;
  data: T;
  visisble?: boolean;
}

export interface BlePacket {
  time: number;
  rssi: number;
  addr: string;
  type: any;
  payload: any;
  raw: any;
  location: {
    lat: number;
    lng: number;
  };
}
export interface PpmPacket {
  [time: string]: {
    total: number;
    cwa: number;
    non_cwa: number;
  };
}
export interface CwaSharePacket {
  [time: string]: number;
}
export interface DpmPacket {
  [time: string]: number;
}
export interface RssiDistPacket {
  [rssiRange: string]: number;
}

export interface RssiStackedPacket {
  [time: string]: {
    [rssiRange: string]: number;
  };
}
export interface AvgRssiPacket {
  [time: string]: {
    sum: number;
    count: number;
    avg: number;
  };
}

export interface TotalValuesPacket {
  sum: number;
  count: number;
  cwa_count: number;
  cwa_share: number;
  cwa_per_min: number;
  avg: number;
  max: number;
  min: number;
  devices: number;
  location: {
    lat: number;
    lng: number;
  };
}

export interface DataFileInfo {
  filename: string;
  first: number;
  last: number;
  visisble?: boolean;
}

export interface DeviceInfo {
  addr: string;
  avgInterval?: number;
  avgRSSI: number;
  first: number;
  last: number;
  minRSSI: number;
  maxRSSI: number;
  count: number;
  cwa_count: number;
  sumRSSI: number;
}

export interface DevicePacket {
  time: number;
  rssi: number;
}
