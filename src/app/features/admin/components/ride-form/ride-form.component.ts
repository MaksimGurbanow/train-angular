import { AsyncPipe, NgForOf, NgIf } from "@angular/common";
import {
  Component, EventEmitter, inject, Input, OnInit,
  Output
} from "@angular/core";
import {
  AbstractControl,
  FormArray,
  FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators
} from "@angular/forms";
import { TuiLet } from "@taiga-ui/cdk";
import { TuiButton, TuiError, TuiTextfieldOptionsDirective } from "@taiga-ui/core";
import { TUI_VALIDATION_ERRORS, TuiFieldErrorPipe } from "@taiga-ui/kit";
import {
  TuiInputDateTimeModule,
  TuiInputModule,
  TuiInputMonthRangeModule,
  TuiTextfieldControllerModule
} from "@taiga-ui/legacy";
import { of, switchMap, tap } from "rxjs";

import { FullRideType, RideType } from "../../models/ride.module";
import { RideService } from "../../services/ride.service";

@Component({
  selector: "app-ride-form",
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    ReactiveFormsModule,
    NgForOf,
    TuiButton,
    TuiLet,
    TuiInputModule,
    TuiInputMonthRangeModule,
    TuiTextfieldOptionsDirective,
    TuiTextfieldControllerModule,
    TuiError,
    TuiFieldErrorPipe,
    TuiInputDateTimeModule
  ],
  templateUrl: "./ride-form.component.html",
  styleUrl: "./ride-form.component.scss",
  providers: [
    {
      provide: TUI_VALIDATION_ERRORS,
      useValue: {
        required: "This field is required",
        pattern: "Incorrect price",
        min: "Price should be greater than 0",
      }
    }
  ],
})
export class RideFormComponent implements OnInit {
  @Input() rideForEdit!: FullRideType["schedule"][number];
  @Input() routeId!: number;
  @Output() closeForm = new EventEmitter();

  private readonly rideService = inject(RideService);
  private readonly fb = inject(FormBuilder);

  readonly route$ = this.rideService.route$;

  public rideForm!: FormGroup;

  ngOnInit() {
    window.scrollTo({ top: 0, behavior: "smooth" });

    this.route$.pipe(
      switchMap((route) => {
        if (this.rideForEdit) {
          return of(this.getInitialFormGroupForEdit());
        }
        const numberOfStations = Object.entries(route?.path as object).length;
        const carriages = route?.carriages;
        const numberOfCarriages = [...new Set(carriages)].length;

        return of(this.getEmptyFormGroup(numberOfCarriages, numberOfStations));
      }),
      tap((formGroup) => {
        this.rideForm = formGroup;
      })
    ).subscribe();
  }

  private getInitialFormGroupForEdit(): FormGroup {
    const segments = this.rideForEdit.segments.map((segment) => this.fb.group({
      departure: new FormControl(this.formatDateTime(segment.time[0]), { validators: [Validators.required] }),
      arrival: new FormControl(this.formatDateTime(segment.time[1]), { validators: [Validators.required] }),
      price: this.fb.group(this.createPriceControls(segment.price))
    }));

    return this.fb.group({
      segments: this.fb.array(segments)
    });
  }

  private getEmptyFormGroup(carriagesLength: number, numberOfStations: number): FormGroup {
    const segments = Array.from({ length: numberOfStations }, () => this.fb.group({
      departure: new FormControl("", { validators: [Validators.required] }),
      arrival: new FormControl("", { validators: [Validators.required] }),
      price: this.fb.group(this.createEmptyPriceControls(carriagesLength))
    }));

    return this.fb.group({
      segments: this.fb.array(segments)
    });
  }

  private createEmptyPriceControls(carriagesLength: number): { [key: string]: FormControl } {
    const controls: { [key: string]: FormControl } = {};
    for (let i = 1; i <= carriagesLength; i++) {
      controls[`carriage${i}`] = new FormControl("", {
        validators: [
          Validators.required,
          Validators.pattern("^[0-9]*$"),
          Validators.min(1)]
      });
    }
    return controls;
  }

  private formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private createPriceControls(price: { [key: string]: number }): { [key: string]: FormControl } {
    const controls: { [key: string]: FormControl } = {};
    Object.entries(price).forEach(([key, value]) => {
      controls[key] = new FormControl(value, {
        validators: [
          Validators.required,
          Validators.pattern("^[0-9]*$"),
          Validators.min(1)]
      });
    });
    return controls;
  }

  get segments(): FormArray {
    return this.rideForm.get("segments") as FormArray;
  }

  getPriceKeys(control: AbstractControl | null): string[] {
    if (control instanceof FormGroup) {
      return Object.keys(control.controls);
    }
    return [];
  }

  onFormSubmitHandler() {
    type Segment = {
      arrival: string,
      departure: string,
      price: {
        [key: string]: number
      }[]
    };

    const segments: RideType["schedule"][number]["segments"] = this.rideForm.value?.segments.map(
      (segment: Segment) => ({
        price: segment.price,
        time: [segment.departure, segment.arrival]
      })
    );

    if (this.rideForEdit) {
      this.rideService.updateRide(segments, this.routeId, this.rideForEdit.rideId);
    } else {
      this.rideService.createRide(segments, this.routeId);
    }

    this.onCloseFormHandler();
  }

  onCloseFormHandler() {
    this.closeForm.emit();
  }
}
