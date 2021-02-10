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

export interface DataFileInfo {
  filename: string;
  first: number;
  last: number;
  visisble?: boolean;
}
