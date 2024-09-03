import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { TuiAlertService, TuiDialogService } from "@taiga-ui/core";
import { BehaviorSubject, catchError, EMPTY } from "rxjs";

import { AuthService } from "../../authorization/services/auth.service";
import { MarkerType, StationType } from "../models/station.model";

@Injectable({
  providedIn: "root"
})
export class StationsService {
  private readonly authService = inject(AuthService);
  private readonly httpClient = inject(HttpClient);

  private readonly stationsSubject$$ = new BehaviorSubject<StationType[]>([]);
  readonly stations$ = this.stationsSubject$$.asObservable();

  private readonly markersSubject$$ = new BehaviorSubject<MarkerType[]>([]);
  readonly markers$ = this.markersSubject$$.asObservable();

  private readonly isLoadingSubject$$ = new BehaviorSubject<boolean>(false);
  readonly isLoading$ = this.isLoadingSubject$$.asObservable();

  private readonly selectedStationSubject$$ = new BehaviorSubject<StationType | null>(null);
  readonly selectedStation$ = this.selectedStationSubject$$.asObservable();

  private readonly alerts = inject(TuiAlertService);
  private readonly dialogs = inject(TuiDialogService);

  getStations() {
    this.isLoadingSubject$$.next(true);
    this.httpClient.get<StationType[]>("/api/station")

      .subscribe((data) => {
        this.stationsSubject$$.next(data);

        const markers: MarkerType[] = data.map((station) => ({
          position: {
            lat: station.latitude,
            lng: station.longitude
          }
        }));

        this.markersSubject$$.next(markers);
        this.isLoadingSubject$$.next(false);
      });
  }

  createStation(city: string, longitude: number, latitude: number, relations: string[] = []) {
    const stations = this.stationsSubject$$.value;
    const relationsId = relations.map((relation) => stations.find((s) => s.city === relation)?.id);

    this.httpClient.post<StationType>("/api/station", {
      city, longitude, latitude, relations: relationsId
    }, { observe: "response" })
      .pipe(catchError((e) => {
        if (e.status === 401) {
          this.dialogs.open("You are not authorized").subscribe();
        } else {
          this.dialogs.open("invalid station data").subscribe();
        }
        return EMPTY;
      })).subscribe(
        () => {
          this.getStations();
          this.alerts.open("Station created successfully").subscribe();
        }
      );
  }

  deleteStation(id: number) {
    return this.httpClient.delete(`/api/station/${id}`).pipe(
      catchError(
        (e) => {
          if (e.status === 401) {
            this.dialogs.open("You are not authorized").subscribe();
          }
          return EMPTY;
        }
      ),
    ).subscribe(
      () => {
        this.getStations();
        this.alerts.open("Station deleted successfully").subscribe();
      }
    );
  }

  selectStationByCoordinates(lat: number, lng: number) {
    const stations = this.stationsSubject$$.value;
    const selectedStation = stations.find((s) => s.latitude === lat && s.longitude === lng);
    if (selectedStation) {
      this.selectedStationSubject$$.next(selectedStation);
    }
  }

  isStationExist(city: string, lng: string, lat: string) {
    const allStations = this.stationsSubject$$.value;

    if (allStations.find((s) => s.city === city)) {
      return true;
    }

    if (allStations.find((s) => s.latitude === Number(lat) && s.longitude === Number(lng))) {
      return true;
    }

    return false;
  }

  getStationById(id: string | number) {
    return this.stationsSubject$$.getValue().find((station) => station.id === Number(id));
  }

  getStationByName(name: string) {
    return this.stationsSubject$$.getValue().find((station) => station.city === name);
  }
}
