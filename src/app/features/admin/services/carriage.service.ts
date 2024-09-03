import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { TuiAlertService, TuiDialogService } from "@taiga-ui/core";
import { BehaviorSubject, catchError, EMPTY } from "rxjs";

import { Segment } from "../../../../types";
import { CarriageType } from "../models/carriages.model";

@Injectable({
  providedIn: "root"
})
export class CarriageService {
  private readonly httpClient = inject(HttpClient);

  private readonly isLoadingSubject$$ = new BehaviorSubject<boolean>(false);
  readonly isLoading$ = this.isLoadingSubject$$.asObservable();

  private readonly carriagesSubject$$ = new BehaviorSubject<CarriageType[]>([]);
  readonly carriages$ = this.carriagesSubject$$.asObservable();

  private readonly alerts = inject(TuiAlertService);
  private readonly dialogs = inject(TuiDialogService);

  readonly seats: { [key: string]: number } = {};

  getCarriages() {
    this.isLoadingSubject$$.next(true);
    this.httpClient.get<CarriageType[]>("/api/carriage").subscribe((resp) => {
      this.carriagesSubject$$.next(resp);
      this.isLoadingSubject$$.next(false);
      for (let i = 0; i < resp.length; i++) {
        const carriage = resp[i];
        this.seats[carriage.name] = (carriage.leftSeats + carriage.rightSeats) * carriage.rows;
      }
    });
  }

  getSeatsMatrix(carriage: CarriageType) {
    if (!carriage) return { rightRows: [], leftRows: [] };

    const seatsMatrix: number[][] = [];
    const sumOfSeatsInARow = carriage.leftSeats + carriage.rightSeats;

    let seatsCounter = 0;
    for (let i = 0; i < carriage.rows; i++) {
      seatsMatrix[i] = [];
      for (let j = 0; j < sumOfSeatsInARow; j++) {
        seatsMatrix[i][j] = seatsCounter++;
      }
    }

    const rotatedMatrix = this.rotateMatrix(seatsMatrix);

    const rightRows = rotatedMatrix.slice(0, carriage.rightSeats);
    const leftRows = rotatedMatrix.slice(carriage.rightSeats);

    return { rightRows, leftRows };
  }

  private rotateMatrix(matrix: number[][]) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const rotatedMatrix = [];

    for (let j = cols - 1; j >= 0; j--) {
      const newRow = [];
      for (let i = 0; i < rows; i++) {
        newRow.push(matrix[i][j]);
      }
      rotatedMatrix.push(newRow);
    }

    return rotatedMatrix;
  }

  createCarriage(carriage: Partial<CarriageType>) {
    if (this.isCarriageExist(carriage.name as string)) {
      this.dialogs
        .open("Carriage with this name already exists")
        .subscribe();
      return;
    }

    this.isLoadingSubject$$.next(true);
    this.httpClient.post("/api/carriage", carriage)
      .pipe(catchError((e) => {
        if (e.status === 401) {
          this.dialogs.open("You are not authorized").subscribe();
        } else {
          this.dialogs.open("invalid data").subscribe();
        }
        this.isLoadingSubject$$.next(false);
        return EMPTY;
      }))
      .subscribe(
        () => {
          this.getCarriages();
          this.alerts.open("", {
            label: "Carriage has been created",
            appearance: "warning",
            autoClose: 10000
          }).subscribe();
        }
      );
  }

  updateCarriage(carriage: CarriageType) {
    this.httpClient.put(`/api/carriage/${carriage.code}`, carriage)
      .pipe(catchError((e) => {
        if (e.status === 401) {
          this.dialogs.open("You are not authorized").subscribe();
        } else {
          this.dialogs.open("invalid data")
            .subscribe();
        }
        this.isLoadingSubject$$.next(false);
        return EMPTY;
      })).subscribe(
        () => {
          this.getCarriages();
          this.alerts.open(
            "",
            {
              label: "Carriage has been updated",
              appearance: "warning",
              autoClose: 10000
            }
          ).subscribe();
        }
      );
  }

  isCarriageExist(name: string) {
    const carriages = this.carriagesSubject$$.getValue();
    return carriages.find((carriage) => carriage.code === name);
  }

  calcTripPrice(segments: Segment[], carriageType: string) {
    return `${segments.reduce((accum, segment) => accum + segment.price[carriageType], 0) / 100}$`;
  }

  getCarriageByType(type: string) {
    return this.carriagesSubject$$.getValue().find((carr) => carr.name === type);
  }

  getCarriageValue() {
    return this.carriagesSubject$$.getValue();
  }
}
