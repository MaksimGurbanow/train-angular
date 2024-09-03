import { AsyncPipe } from "@angular/common";
import {
  Component, EventEmitter, inject, Input, OnChanges, OnInit,
  Output
} from "@angular/core";
import {
  FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators
} from "@angular/forms";
import { TuiButton, TuiError } from "@taiga-ui/core";
import { TUI_VALIDATION_ERRORS, TuiFieldErrorPipe } from "@taiga-ui/kit";
import { TuiInputModule, TuiInputYearModule } from "@taiga-ui/legacy";

import { CarriageType } from "../../models/carriages.model";
import { CarriageService } from "../../services/carriage.service";
import { CarriageComponent } from "../carriage/carriage.component";

@Component({
  selector: "app-carriage-form",
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    TuiError,
    TuiFieldErrorPipe,
    TuiInputModule,
    TuiInputYearModule,
    TuiButton,
    CarriageComponent
  ],
  templateUrl: "./carriage-form.component.html",
  styleUrl: "./carriage-form.component.scss",
  providers: [
    {
      provide: TUI_VALIDATION_ERRORS,
      useValue: {
        required: "This field is required",
        pattern: "Enter correct data",
      }
    }
  ],
})
export class CarriageFormComponent implements OnChanges, OnInit {
  private readonly carriageService = inject(CarriageService);
  @Input() carriage!: CarriageType;
  @Input() isEditing: boolean = false;

  @Output() closeForm = new EventEmitter<void>();

  readonly carriageForm = new FormGroup({
    name: new FormControl(
      "",
      { validators: [Validators.required], nonNullable: true }
    ),
    rows: new FormControl(
      "",
      { validators: [Validators.required], nonNullable: true }
    ),
    leftSeats: new FormControl(
      "",
      { validators: [Validators.required], nonNullable: true }
    ),
    rightSeats: new FormControl(
      "",
      { validators: [Validators.required], nonNullable: true }
    ),
  });

  ngOnInit(): void {
    this.carriageForm.controls.rows.valueChanges.subscribe((v) => {
      this.carriage = { ...this.carriage, rows: +v };
    });
    this.carriageForm.controls.rightSeats.valueChanges.subscribe((v) => {
      this.carriage = { ...this.carriage, rightSeats: +v };
    });
    this.carriageForm.controls.leftSeats.valueChanges.subscribe((v) => {
      this.carriage = { ...this.carriage, leftSeats: +v };
    });

    if (!this.isEditing) {
      this.carriageForm.controls.rows.setValue("5");
      this.carriageForm.controls.leftSeats.setValue("3");
      this.carriageForm.controls.rightSeats.setValue("3");
    }
  }

  ngOnChanges(): void {
    if (this.isEditing) {
      this.carriageForm.controls.name.setValue(String(this.carriage.name));
      this.carriageForm.controls.rows.setValue(String(this.carriage.rows));
      this.carriageForm.controls.leftSeats.setValue(String(this.carriage.leftSeats));
      this.carriageForm.controls.rightSeats.setValue(String(this.carriage.rightSeats));
    }
  }

  onCloseFormHandler() {
    this.closeForm.emit();
  }

  onSubmitFormHandler() {
    const {
      name, rows, leftSeats, rightSeats
    } = this.carriageForm.value;

    if (this.isEditing) {
      this.carriageService.updateCarriage({
        ...this.carriage,
        name: String(name),
        rows: +rows!,
        leftSeats: +leftSeats!,
        rightSeats: +rightSeats!
      });
    } else {
      this.carriageService.createCarriage({
        name,
        rows: +rows!,
        leftSeats: +leftSeats!,
        rightSeats: +rightSeats!,
        code: this.carriage.code
      });
    }

    this.onCloseFormHandler();
  }
}
