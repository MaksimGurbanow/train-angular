import { DatePipe, Location, NgIf } from "@angular/common";
import {
  Component, computed, inject, OnInit, signal
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {
  TuiAlertService, TuiButton, TuiIcon, TuiLoader
} from "@taiga-ui/core";
import { TuiChevron, TuiTabs } from "@taiga-ui/kit";

import { Ride } from "../../../../types";
import { CarriageComponent } from "../../../features/admin/components/carriage/carriage.component";
import { CarriageService } from "../../../features/admin/services/carriage.service";
import { StationsService } from "../../../features/admin/services/stations.service";
import { RideService } from "../../services/ride.service";

@Component({
  selector: "app-search-detail",
  standalone: true,
  imports: [
    CarriageComponent,
    TuiIcon,
    DatePipe,
    TuiButton,
    TuiChevron,
    NgIf,
    TuiLoader,
    TuiTabs,
  ],
  templateUrl: "./search-detail.component.html",
  styleUrl: "./search-detail.component.scss",
})
export class SearchDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly rideService = inject(RideService);
  private readonly stationsService = inject(StationsService);
  private readonly location = inject(Location);
  private readonly carriageService = inject(CarriageService);
  private readonly alerts = inject(TuiAlertService);

  protected readonly ride = signal<Ride | null>(null);
  protected readonly carriages = computed(() => this.ride()!.carriages || []);
  protected readonly paths = computed(() => this.ride()?.path || []);
  protected readonly segments = computed(
    () => this.ride()?.schedule.segments || []
  );
  protected readonly selectedSeat = computed(
    () => this.rideService.selectedSeat()
  );

  protected readonly from = signal("");
  protected readonly to = signal("");
  protected readonly carriageTypes = computed(() => Array.from(new Set(this.carriages())));

  protected open = false;

  protected activeItemIndex = 0;
  protected activeCarriageType = signal("");
  protected readonly filteredCarriages = computed(() => this.carriages()
    .map((carriage, index) => ({ type: carriage, index: index + 1 }))
    .filter((carriage) => carriage.type === this.activeCarriageType()));

  ngOnInit() {
    const rideId = Number(this.route.snapshot.paramMap.get("rideId"));
    this.route.queryParams.subscribe((next) => {
      this.from.set(next["from"]);
      this.to.set(next["to"]);
    });

    this.rideService.getRide(rideId).subscribe((next) => {
      this.ride.set(next);
      this.activeCarriageType.set(next.carriages[0]);
    });

    this.stationsService.getStations();

    this.carriageService.getCarriages();
  }

  protected onClick(e?: Event): void {
    e?.stopPropagation();
    this.open = !this.open;
  }

  protected getStationById(id: string | number) {
    return this.stationsService.getStationById(id);
  }

  protected calcTimeDifference(firstTime: string, lastTime: string) {
    const diff = new Date(lastTime).getTime() - new Date(firstTime).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return {
      days,
      hours,
      minutes,
      diff,
    };
  }

  protected goBack() {
    this.location.back();
  }

  protected onTabClick(item: string): void {
    this.activeItemIndex = this.carriageTypes().findIndex(
      (type) => type === item
    );
    this.activeCarriageType.set(item);
  }

  protected calcTripPrice(carriage: string) {
    return this.carriageService.calcTripPrice(this.segments(), carriage);
  }

  getCarriageByType(type: string) {
    return this.carriageService.getCarriageByType(type);
  }

  definedOccupiedSeats() {
    const fromIndex = this.paths().findIndex(
      (path) => path === this.stationsService.getStationByName(this.from())?.id
    );
    const toIndex = this.paths().findIndex(
      (path) => path === this.stationsService.getStationByName(this.to())?.id
    );

    return Array.from(
      new Set(
        this.segments()
          .slice(fromIndex, toIndex)
          .map((segment) => segment.occupiedSeats)
          .flat()
      )
    );
  }

  calcSpan(index: number) {
    return this.carriages().slice(0, index).reduce((accum, carType) => {
      const { rows, rightSeats, leftSeats } = this.carriageService.getCarriageByType(carType)!;
      return accum + rows * (rightSeats + leftSeats);
    }, 0);
  }

  cancelOrder() {
    this.rideService.selectedSeat.set(null);
  }

  bookTrip() {
    this.rideService.createOrder({
      rideId: this.ride()?.rideId || 0,
      stationStart: this.stationsService.getStationByName(this.from())?.id || 0,
      stationEnd: this.stationsService.getStationByName(this.to())?.id || 0,
    }).subscribe({
      next: () => {
        this.alerts.open(
          "",
          {
            label: "Booked succesfully",
            autoClose: 3000,
          }
        ).subscribe();
      },
      error: (err) => {
        let message;
        if (err.message === "Access is not granted") {
          message = "You are not authorized";
        }
        this.alerts.open(
          "",
          {
            label: message || err.message,
            autoClose: 3000,
          }
        ).subscribe();
      }
    });
  }
}
