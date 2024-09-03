import { AsyncPipe, CommonModule, JsonPipe } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { TuiButton, TuiLoader } from "@taiga-ui/core";

import { CarriageComponent } from "../../components/carriage/carriage.component";
import { CarriageFormComponent } from "../../components/carriage-form/carriage-form.component";
import { MapComponent } from "../../components/map/map.component";
import { StationFormComponent } from "../../components/station-form/station-form.component";
import { CarriageType } from "../../models/carriages.model";
import { CarriageService } from "../../services/carriage.service";

@Component({
  selector: "app-carriages",
  standalone: true,
  imports: [
    AsyncPipe,
    StationFormComponent,
    MapComponent,
    TuiLoader,
    JsonPipe,
    CarriageComponent,
    CarriageFormComponent,
    CommonModule,
    TuiButton
  ],
  templateUrl: "./carriages.component.html",
  styleUrl: "./carriages.component.scss"
})
export class CarriagesComponent implements OnInit {
  private readonly carriageService = inject(CarriageService);
  readonly carriages$ = this.carriageService.carriages$;
  readonly isLoading$ = this.carriageService.isLoading$;

  carriageForEdit: CarriageType | null = null;
  isCreatingCarriage: boolean = false;

  ngOnInit() {
    this.carriageService.getCarriages();
  }

  openFormForCreatingCarriage() {
    this.carriageForEdit = null;
    this.isCreatingCarriage = true;
  }

  editCarriage(carriage: CarriageType) {
    this.carriageForEdit = carriage;
    this.isCreatingCarriage = false;
  }

  closeForm() {
    this.carriageForEdit = null;
    this.isCreatingCarriage = false;
  }
}
