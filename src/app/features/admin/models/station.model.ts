export type StationType = {
  city: string,
  connectedTo: {
    id: number,
    distance: number
  },
  id: number,
  latitude: number,
  longitude: number,
};

export type MarkerType = {
  position: {
    lat: number;
    lng: number;
  }
};
