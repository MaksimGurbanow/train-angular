import { DatePipe, NgForOf, NgIf } from "@angular/common";
import {
  Component, inject, Input, OnInit
} from "@angular/core";
import { Router } from "@angular/router";
import { TuiButton, TuiIcon } from "@taiga-ui/core";

import {
  Route, Schedule, Segment, Station
} from "../../../../types";
import { CarriageService } from "../../../features/admin/services/carriage.service";
import { StationsService } from "../../../features/admin/services/stations.service";

@Component({
  selector: "app-trip-item",
  standalone: true,
  imports: [DatePipe, TuiButton, TuiIcon, NgIf, NgForOf],
  templateUrl: "./trip-item.component.html",
  styleUrl: "./trip-item.component.scss",
})
export class TripItemComponent implements OnInit {
  private readonly stationsService = inject(StationsService);
  private readonly carriageService = inject(CarriageService);
  private readonly router = inject(Router);
  @Input() trip!: Route;
  @Input() fromStation: Station | null = null;
  @Input() toStation: Station | null = null;
  firstIndex = 0;
  lastIndex = 0;
  paths: number[] = [];
  schedule: Schedule | null = null;
  segments: Segment[] = [];
  protected open = false;
  protected carriageSeats: { [key: string]: number } = {};

  firstStationTime: string = "";
  lastStationTime: string = "";

  ngOnInit(): void {
    this.carriageService.getCarriages();
    this.carriageSeats = this.carriageService.seats;
    this.paths = this.trip.path;
    [this.schedule] = this.trip.schedule;
    this.segments = this.schedule.segments;
    this.firstIndex = this.getFirstStationIndex(this.trip);
    this.lastIndex = this.getLastStationIndex(this.trip);

    [this.firstStationTime,] = this.segments![this.firstIndex].time;
    [,this.lastStationTime] = this.segments![this.lastIndex - 1].time;
  }

  calcTimeDifference(firstTime: string, lastTime: string) {
    const diff = new Date(lastTime).getTime() - new Date(firstTime).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return {
      days, hours, minutes, diff
    };
  }

  protected getStationById(id: string | number) {
    return this.stationsService.getStationById(id);
  }

  protected onClick(e?: Event): void {
    e?.stopPropagation();
    this.open = !this.open;
  }

  protected calcCarriageSeats(carriages: string[]) {
    return carriages.map((carriage) => this.carriageSeats[carriage]);
  }

  protected makeCarriageUnique(carriages: string[]) {
    return Array.from(new Set(carriages));
  }

  protected calcTripPrice(segments: Segment[], carriage: string) {
    return this.carriageService.calcTripPrice(segments, carriage);
  }

  getFirstStationIndex(trip: Route): number {
    return trip.path.findIndex((p: number) => p === this.fromStation?.stationId);
  }

  getLastStationIndex(trip: Route): number {
    return trip.path.findIndex((p: number) => p === this.toStation?.stationId);
  }

  protected moveToDetails() {
    this.router.navigate(
      [`/trip/${this.schedule?.rideId}`],
      {
        queryParams: {
          from: this.fromStation?.city, to: this.toStation?.city
        }
      }
    );
  }
}
