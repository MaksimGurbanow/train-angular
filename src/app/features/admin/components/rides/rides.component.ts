import { AsyncPipe, JsonPipe } from "@angular/common";
import {
  Component, EventEmitter, inject, Input, OnInit,
  Output
} from "@angular/core";
import { TuiButton, TuiLoader } from "@taiga-ui/core";

import { FullRideType } from "../../models/ride.module";
import { RideService } from "../../services/ride.service";
import { RideComponent } from "../ride/ride.component";
import { RideFormComponent } from "../ride-form/ride-form.component";

@Component({
  selector: "app-rides",
  standalone: true,
  imports: [
    TuiButton,
    AsyncPipe,
    JsonPipe,
    RideComponent,
    TuiLoader,
    RideFormComponent
  ],
  templateUrl: "./rides.component.html",
  styleUrl: "./rides.component.scss"
})
export class RidesComponent implements OnInit {
  @Input() routeId!: number;
  @Output() closeRouteDetails = new EventEmitter();

  private readonly rideService = inject(RideService);
  readonly route$ = this.rideService.route$;
  readonly isLoading$ = this.rideService.isLoading$;

  rideForEdit: FullRideType["schedule"][number] | null = null;
  isCreatingRide: boolean = false;

  ngOnInit() {
    this.rideService.getRoute(this.routeId as number);
  }

  onCloseRouteDetails() {
    this.closeRouteDetails.emit();
  }

  setRideForEdit(ride: FullRideType["schedule"][number]) {
    this.isCreatingRide = false;
    this.rideForEdit = ride;
  }

  closeFormHandler() {
    this.rideForEdit = null;
    this.isCreatingRide = false;
  }

  onCreateRideHandler() {
    this.isCreatingRide = true;
    this.rideForEdit = null;
  }
}
