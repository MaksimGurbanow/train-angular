import {
  Component, EventEmitter, Input,
  Output
} from "@angular/core";
import { TuiButton } from "@taiga-ui/core";

import { OrderType } from "../../models/order.model";

@Component({
  selector: "app-order",
  standalone: true,
  imports: [
    TuiButton
  ],
  templateUrl: "./order.component.html",
  styleUrl: "./order.component.scss"
})
export class OrderComponent {
  @Input() order!: OrderType;
  @Output() deleteOrder = new EventEmitter();

  deleteOrderHandler() {
    this.deleteOrder.emit(this.order.id);
  }
}
