export interface Segment {
  time: string[];
  price: { [key: string]: number }
  occupiedSeats: number[];
}

export interface Schedule {
  rideId: number;
  segments: Segment[];
}

export interface Route {
  id: number;
  path: number[];
  carriages: string[];
  schedule: Schedule[];
}

export interface Station {
  geolocation: {
    longitude: number;
    latitude: number;
  };
  stationId: number;
  city: string;
}

export interface Ride {
  carriages: string[];
  rideId: number;
  path: number[];
  schedule: {
    segments: Segment[];
  };
}
