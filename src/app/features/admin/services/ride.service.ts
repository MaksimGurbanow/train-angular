import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { TuiAlertService, TuiDialogService } from "@taiga-ui/core";
import { TUI_CONFIRM } from "@taiga-ui/kit";
import {
  BehaviorSubject, catchError, EMPTY, filter, map, switchMap, withLatestFrom
} from "rxjs";

import { FullRideType, RideType } from "../models/ride.module";
import { StationType } from "../models/station.model";
import { StationsService } from "./stations.service";

@Injectable({
  providedIn: "root"
})
export class RideService {
  private readonly httpClient = inject(HttpClient);
  private readonly stationsService = inject(StationsService);
  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);

  private readonly stations$ = this.stationsService.stations$;

  private readonly route$$ = new BehaviorSubject<FullRideType | null>(null);
  readonly route$ = this.route$$.asObservable();

  private readonly isLoading$$ = new BehaviorSubject<boolean>(false);
  readonly isLoading$ = this.isLoading$$.asObservable();

  getRoute(id: number) {
    this.isLoading$$.next(true);
    this.httpClient
      .get<RideType>(`/api/route/${id}`)
      .pipe(catchError((e) => {
        if (e.status === 401) {
          this.dialogs.open("You are not authorized").subscribe();
        } else {
          this.dialogs.open("invalid station data").subscribe();
        }
        return EMPTY;
      }))
      .pipe(
        withLatestFrom(this.stations$),
        map(([ride, stations]) => {
          const fullStationsInfo = ride.path.map((cityId) => stations.find((station) => station.id === cityId));
          return { ...ride, path: fullStationsInfo as StationType[] };
        })
      )
      .subscribe((route) => {
        this.route$$.next(route);
        this.isLoading$$.next(false);
      });
  }

  deleteRide(routeId: number, rideId: number) {
    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
      label: `Delete routeId ${routeId}, rideId ${rideId} ?`,
      size: "s",
      data: { yes: "Yes", no: "No" },
    })
      .pipe(
        filter((response) => response),
        switchMap(() => this.httpClient.delete(`/api/route/${routeId}/ride/${rideId}`)),
        (catchError((e) => {
          if (e.status === 401) {
            this.dialogs.open("You are not authorized").subscribe();
          } else {
            console.log(e);
            this.dialogs.open(`invalid station data. ${e?.message}`).subscribe();
          }
          return EMPTY;
        }))
      ).subscribe(
        () => {
          this.alerts.open("", {
            label: "Ride has been created",
            appearance: "warning",
            autoClose: 10000
          }).subscribe();
        }
      );
  }

  updateRide(ride: RideType["schedule"][number]["segments"], routeId: number, rideId: number) {
    this.isLoading$$.next(true);
    this.httpClient
      .put<RideType>(`/api/route/${routeId}/ride/${rideId}`, { segments: ride })
      .pipe(catchError((e) => {
        if (e.status === 401) {
          this.dialogs.open("You are not authorized").subscribe();
        } else {
          this.dialogs.open("invalid station data").subscribe();
        }
        return EMPTY;
      })).subscribe(() => {
        this.getRoute(routeId);
        this.isLoading$$.next(false);

        this.alerts.open("", {
          label: `Ride ${rideId} has been updated`,
          appearance: "warning",
          autoClose: 10000
        }).subscribe(

        );
      });
  }

  createRide(ride: RideType["schedule"][number]["segments"], routeId: number) {
    this.isLoading$$.next(true);
    this.httpClient
      .post<FullRideType>(`/api/route/${routeId}/ride`, { segments: ride })
      .pipe(catchError((e) => {
        if (e.status === 401) {
          this.dialogs.open("You are not authorized").subscribe();
        } else {
          this.dialogs.open("invalid station data").subscribe();
        }
        return EMPTY;
      })).subscribe(() => {
        this.getRoute(routeId);
        this.isLoading$$.next(false);

        this.alerts.open("", {
          label: "Ride has been created",
          appearance: "warning",
          autoClose: 10000
        }).subscribe();
      });
  }
}
