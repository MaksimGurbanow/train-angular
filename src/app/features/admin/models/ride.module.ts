import { StationType } from "./station.model";

export type RideType = {
  id: number;
  path: number[];
  carriages: string[];
  schedule:{
    rideId: number;
    segments: {
      time: string[];
      price: {
        [key: string]: number;
      };
    }[];
  }[]
};

export type FullRideType = Omit<RideType, "path"> & {
  path: StationType[]
};
