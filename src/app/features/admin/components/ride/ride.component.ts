import {
  AsyncPipe, CurrencyPipe, DatePipe, JsonPipe, NgIf
} from "@angular/common";
import {
  Component, EventEmitter, inject, Input, OnInit, Output
} from "@angular/core";
import { TuiButton, TuiLoader } from "@taiga-ui/core";

import { FullRideType } from "../../models/ride.module";
import { RideService } from "../../services/ride.service";

@Component({
  selector: "app-ride",
  standalone: true,
  imports: [
    JsonPipe,
    NgIf,
    CurrencyPipe,
    AsyncPipe,
    TuiLoader,
    TuiButton,
    DatePipe
  ],
  templateUrl: "./ride.component.html",
  styleUrl: "./ride.component.scss"
})
export class RideComponent implements OnInit {
  @Input() route!: FullRideType | null;
  @Input() scheduleItem!: FullRideType["schedule"][number];

  @Output() editRide = new EventEmitter<FullRideType["schedule"][number]>();

  private readonly rideService = inject(RideService);

  protected readonly Object = Object;

  ngOnInit() {
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  deleteRideHandler() {
    this.rideService.deleteRide(this.route?.id as number, this.scheduleItem.rideId);
  }

  editRideHandler() {
    this.editRide.emit(this.scheduleItem);
  }
}
