import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { TuiAlertService, TuiDialogService } from "@taiga-ui/core";
import { TUI_CONFIRM, TuiConfirmData } from "@taiga-ui/kit";
import {
  BehaviorSubject, catchError, EMPTY, switchMap
} from "rxjs";

import { RouteType } from "../models/route.module";

@Injectable({
  providedIn: "root"
})
export class RoutesService {
  private readonly httpClient = inject(HttpClient);
  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);

  private readonly routesSubject$$ = new BehaviorSubject<RouteType[]>([]);
  readonly routes$ = this.routesSubject$$.asObservable();

  private readonly isLoadingSubject$$ = new BehaviorSubject<boolean>(false);
  readonly isLoading$ = this.isLoadingSubject$$.asObservable();

  getRoutes() {
    this.isLoadingSubject$$.next(true);
    this.httpClient
      .get<RouteType[]>("/api/route")
      .subscribe((routes) => {
        this.routesSubject$$.next(routes);
        this.isLoadingSubject$$.next(false);
      });
  }

  createNewRoute(path: number[], carriages: string[]) {
    this.isLoadingSubject$$.next(true);
    const route = { path, carriages };
    this.httpClient
      .post<{ id: number }>("/api/route", route)
      .pipe(
        catchError((e) => {
          if (e.status === 401) {
            this.dialogs.open("You are not authorized").subscribe();
          } else {
            this.dialogs.open("invalid data").subscribe();
          }
          this.isLoadingSubject$$.next(false);
          return EMPTY;
        })
      )
      .subscribe((response) => {
        console.log(response);

        this.alerts.open("", {
          label: `Route created. Id of route: ${response.id}`,
          appearance: "warning",
          autoClose: 10000
        }).subscribe();

        this.getRoutes();
        this.isLoadingSubject$$.next(false);
      });
  }

  removeRoute(id: number) {
    const confirmData: TuiConfirmData = {
      yes: "Yes",
      no: "No",
    };

    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
      label: "Delete?",
      size: "s",
      data: confirmData,
    }).pipe(
      switchMap((response) => {
        if (!response) {
          return EMPTY;
        }
        return this.httpClient.delete<RouteType[]>(`/api/route/${id}`);
      }),
      catchError((e) => {
        if (e.status === 401) {
          this.dialogs.open("You are not authorized").subscribe();
        } else {
          this.dialogs.open("invalid data").subscribe();
        }
        this.isLoadingSubject$$.next(false);
        return EMPTY;
      })
    ).subscribe(
      () => {
        this.getRoutes();
        this.isLoadingSubject$$.next(false);
        this.alerts.open("", {
          label: "Route has been removed",
          autoClose: 3000
        }).subscribe();
      }
    );
  }

  updateRoute(id: number, path: number[], carriages: string[]) {
    this.isLoadingSubject$$.next(true);
    const route = { path, carriages };
    this.httpClient
      .put(`/api/route/${id}`, route)
      .pipe(
        catchError((e) => {
          if (e.status === 401) {
            this.dialogs.open("You are not authorized").subscribe();
          } else {
            this.dialogs.open("invalid data").subscribe();
          }
          this.isLoadingSubject$$.next(false);
          return EMPTY;
        })
      )
      .subscribe(
        () => {
          this.getRoutes();
          this.isLoadingSubject$$.next(false);
          this.alerts.open("", {
            label: `Route ${id} has been updated`,
            appearance: "warning",
            autoClose: 10000
          }).subscribe();
        }
      );
  }
}
