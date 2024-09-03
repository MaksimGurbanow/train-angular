import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { TuiAlertService } from "@taiga-ui/core";
import { BehaviorSubject, catchError, EMPTY } from "rxjs";

import { OrderType } from "../models/order.model";

@Injectable({
  providedIn: "root"
})
export class OrderService {
  private readonly httpClient = inject(HttpClient);

  private readonly orders$$ = new BehaviorSubject<OrderType[]>([]);
  readonly orders$ = this.orders$$.asObservable();

  private readonly alerts = inject(TuiAlertService);

  getOrder() {
    this.httpClient.get<OrderType[]>("/api/order")
      .pipe(
        catchError(() => {
          this.alerts.open("", {
            label: "Error",
            autoClose: 3000
          }).subscribe();
          return EMPTY;
        })
      )
      .subscribe((data) => {
        this.orders$$.next(data);
      });
  }

  deleteOrder(id: string) {
    this.httpClient.delete(`/api/order/${id}`)
      .pipe(
        catchError(() => {
          this.alerts.open("", {
            label: "Error",
            autoClose: 3000
          }).subscribe();
          return EMPTY;
        })
      ).subscribe(() => {
        this.alerts.open("", {
          label: "Order deleted",
          autoClose: 3000
        }).subscribe();
      });
  }
}
