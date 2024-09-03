import { AsyncPipe, JsonPipe, NgForOf } from "@angular/common";
import {
  Component, EventEmitter, inject, Input, OnChanges, Output
} from "@angular/core";
import {
  FormArray, FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators
} from "@angular/forms";
import { TuiAmountPipe } from "@taiga-ui/addon-commerce";
import { TuiLet } from "@taiga-ui/cdk";
import {
  TuiButton, TuiDropdown, TuiError, TuiTextfieldOptionsDirective, TuiTitle
} from "@taiga-ui/core";
import {
  TUI_VALIDATION_ERRORS,
  TuiAvatar, TuiDataListWrapper, TuiDataListWrapperComponent, TuiFieldErrorPipe, TuiFilterByInputPipe
} from "@taiga-ui/kit";
import { TuiCell } from "@taiga-ui/layout";
import {
  TuiComboBoxModule,
  TuiInputNumberModule,
  TuiMultiSelectModule,
  TuiSelectModule,
  TuiTextfieldControllerModule
} from "@taiga-ui/legacy";
import { map } from "rxjs";

import { CarriageType } from "../../models/carriages.model";
import { RouteType } from "../../models/route.module";
import { StationType } from "../../models/station.model";
import { CarriageService } from "../../services/carriage.service";
import { RoutesService } from "../../services/routes.service";
import { StationsService } from "../../services/stations.service";

@Component({
  selector: "app-route-form",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgForOf,
    AsyncPipe,
    TuiComboBoxModule,
    TuiDataListWrapperComponent,
    TuiInputNumberModule,
    TuiLet,
    TuiTextfieldControllerModule,
    TuiTextfieldOptionsDirective,
    TuiSelectModule,
    AsyncPipe,
    FormsModule,
    TuiDropdown,
    TuiDataListWrapper,
    TuiFilterByInputPipe,
    TuiMultiSelectModule,
    TuiButton,
    TuiInputNumberModule,
    TuiAvatar,
    TuiTitle,
    TuiAmountPipe,
    TuiCell,
    JsonPipe,
    TuiError,
    TuiFieldErrorPipe,
  ],
  templateUrl: "./route-form.component.html",
  styleUrl: "./route-form.component.scss",
  providers: [
    {
      provide: TUI_VALIDATION_ERRORS,
      useValue: {
        required: "This field is required",
      }
    }
  ],
})
export class RouteFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly stationsService = inject(StationsService);
  private readonly carriageService = inject(CarriageService);
  private readonly routesService = inject(RoutesService);

  readonly stations$ = this.stationsService.stations$;
  readonly carriages$ = this.carriageService.carriages$;

  public routeForm = this.fb.group(this.getInitialFormGroup());

  @Input() isCreating: boolean = true;
  @Input() routeForEditing: RouteType | null = null;
  @Output() closeForm = new EventEmitter();

  ngOnChanges() {
    if (this.isCreating) {
      console.log("creating");
      this.routeForm = this.fb.group(this.getInitialFormGroup());
      return;
    }

    this.stations$.pipe(
      map((stations) => stations.filter((s) => this.routeForEditing?.path.includes(s.id)))
    ).subscribe(
      (stations) => {
        const stationsArray = this.routeForm.controls.stations;
        stationsArray.clear();
        stations.forEach((station) => {
          stationsArray.push(this.createStationsFormGroup(station));
        });
      }
    );

    this.carriages$.pipe(
      map((carriages) => carriages.filter((c) => this.routeForEditing?.carriages.includes(c.code)))
    ).subscribe(
      (carriages) => {
        const carriagesArray = this.routeForm.controls.carriages;
        carriagesArray.clear();
        carriages.forEach((carriage) => {
          carriagesArray.push(this.createCarriagesFormGroup(carriage));
        });
      }
    );
  }

  private getInitialFormGroup() {
    return {
      stations: this.fb.array([
        this.createStationsFormGroup(),
        this.createStationsFormGroup(),
        this.createStationsFormGroup()]),
      carriages: this.fb.array([
        this.createCarriagesFormGroup(),
        this.createCarriagesFormGroup(),
        this.createCarriagesFormGroup()]),
    };
  }

  private createStationsFormGroup(value?: StationType) {
    return this.fb.group({ station: new FormControl(value, { validators: [Validators.required] }) });
  }
  private createCarriagesFormGroup(value?: CarriageType) {
    return this.fb.group({ carriage: new FormControl(value, { validators: [Validators.required] }) });
  }

  get stationsControls() {
    return this.routeForm.get("stations") as FormArray;
  }
  get carriagesControls() {
    return this.routeForm.get("carriages") as FormArray;
  }

  public addStation() {
    const stations = this.routeForm.controls.stations as FormArray;
    stations.push(this.createStationsFormGroup());
  }

  public addCarriage() {
    const carriages = this.routeForm.controls.carriages as FormArray;
    carriages.push(this.createCarriagesFormGroup());
  }

  public removeStation(index: number) {
    const stations = this.routeForm.controls.stations as FormArray;
    if (stations.length > 1) {
      stations.removeAt(index);
    }
  }

  public removeCarriage(index: number) {
    const carriages = this.routeForm.controls.carriages as FormArray;
    if (carriages.length > 1) {
      carriages.removeAt(index);
    }
  }

  public formSubmitHandler() {
    const carriages = this.routeForm.value.carriages?.map((c) => c.carriage?.code);
    const stations = this.routeForm.value.stations?.map((s) => s.station?.id);

    if (this.isCreating) {
      this.routesService.createNewRoute(stations as number[], carriages as string[]);
    } else {
      this.routesService.updateRoute(
        this.routeForEditing?.id as number,
        stations as number[],
        carriages as string[]
      );
    }

    this.closeFormHandler();
  }

  public closeFormHandler() {
    this.closeForm.emit();
  }
}
