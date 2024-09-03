export type OrderType = {
  id: number,
  rideId: number,
  routeId: number,
  seatId: number,
  userId: number,
  status: "active" | "completed" | "rejected" | "canceled",
  path: number[],
  carriages: string[],
  schedule: {
    time: string[],
    price: {
      [key: string]: number
    }
  }[]
};
