import { AsyncPipe } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";

import { OrderComponent } from "../../components/order/order.component";
import { OrderService } from "../../services/order.service";

@Component({
  selector: "app-order-page",
  standalone: true,
  imports: [
    AsyncPipe,
    OrderComponent
  ],
  templateUrl: "./order-page.component.html",
  styleUrl: "./order-page.component.scss"
})
export class OrderPageComponent implements OnInit {
  private readonly orderService = inject(OrderService);

  readonly orders$ = this.orderService.orders$;

  ngOnInit() {
    this.orderService.getOrder();
  }

  deleteOrder(id: string) {
    this.orderService.deleteOrder(id);
  }
}
