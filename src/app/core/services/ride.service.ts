import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";

import { Ride } from "../../../types";

@Injectable({
  providedIn: "root",
})
export class RideService {
  private readonly httpClient = inject(HttpClient);

  readonly selectedSeat = signal<{
    car: number;
    seat: number;
    price: string;
    span: number;
  } | null>(null);

  getRide(id: number) {
    return this.httpClient.get<Ride>(`/api/search/${id}`);
  }

  createOrder({
    rideId,
    stationStart,
    stationEnd,
  }: {
    rideId: number;
    stationStart: number;
    stationEnd: number;
  }) {
    return this.httpClient.post("/api/order", {
      rideId,
      seat: this.selectedSeat()!.seat + this.selectedSeat()!.span,
      stationStart,
      stationEnd,
    });
  }
}
