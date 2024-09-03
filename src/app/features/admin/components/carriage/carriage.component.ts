import {
  AsyncPipe, JsonPipe, NgForOf, NgIf
} from "@angular/common";
import {
  Component,
  computed,
  effect,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
} from "@angular/core";
import { TuiButton, TuiFormatNumberPipe } from "@taiga-ui/core";

import { RideService } from "../../../../core/services/ride.service";
import { CarriageType } from "../../models/carriages.model";
import { CarriageService } from "../../services/carriage.service";

@Component({
  selector: "app-carriage",
  standalone: true,
  imports: [NgForOf, TuiFormatNumberPipe, AsyncPipe, JsonPipe, TuiButton, NgIf],
  templateUrl: "./carriage.component.html",
  styleUrl: "./carriage.component.scss",
})
export class CarriageComponent implements OnChanges {
  @Input() carriage!: CarriageType;
  @Output() editCarriage = new EventEmitter<CarriageType>();
  @Input() isEditing: boolean = false;
  @Input() occupiedSeats: number[] = [];
  @Input() forUser = false;
  @Input() index = 0;
  @Input() span = 0;
  @Input() price = "";

  private readonly rideService = inject(RideService);
  selectedSeat = this.rideService?.selectedSeat();

  private readonly totalSeats = computed(
    () => this.carriage.rows * (this.carriage.rightSeats + this.carriage.leftSeats)
  );

  private readonly carriageService = inject(CarriageService);

  leftRows: number[][] = [];
  rightRows: number[][] = [];

  constructor() {
    effect(() => {
      this.selectedSeat = this.rideService?.selectedSeat();
    });
  }

  onEditHandler() {
    this.editCarriage.emit(this.carriage);

    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }

  ngOnChanges() {
    const { leftRows, rightRows } = this.carriageService.getSeatsMatrix(
      this.carriage
    );

    this.leftRows = leftRows;
    this.rightRows = rightRows;
  }

  isFree(num: number) {
    return !this.occupiedSeats.some((seat) => seat === num + this.span);
  }

  calcAvailableSeats() {
    return this.totalSeats() - this.occupiedSeats
      .filter((seat) => seat >= this.span && seat <= this.span + this.totalSeats()).length;
  }

  onSeatClick(seat: number) {
    this.rideService.selectedSeat.set({
      seat, car: this.index, price: this.price, span: this.span
    });
  }
}
