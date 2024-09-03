import { AsyncPipe, NgIf } from "@angular/common";
import {
  ChangeDetectionStrategy, Component, inject, OnInit
} from "@angular/core";
import {
  FormControl, FormGroup, ReactiveFormsModule, Validators
} from "@angular/forms";
import { TUI_DEFAULT_MATCHER, tuiPure } from "@taiga-ui/cdk";
import {
  TuiButton, TuiDataList, TuiDialogService, TuiError
} from "@taiga-ui/core";
import {
  TUI_CONFIRM,
  TUI_VALIDATION_ERRORS,
  TuiConfirmData,
  TuiDataListWrapper,
  TuiFieldErrorPipe,
  TuiFilterByInputPipe,
  TuiStringifyContentPipe
} from "@taiga-ui/kit";
import {
  TuiComboBoxModule, TuiInputModule, TuiInputYearModule, TuiMultiSelectModule, TuiTextfieldControllerModule
} from "@taiga-ui/legacy";
import { filter } from "rxjs/operators";

import { StationType } from "../../models/station.model";
import { StationsService } from "../../services/stations.service";

@Component({
  selector: "app-station-form",
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    ReactiveFormsModule,
    TuiError,
    TuiFieldErrorPipe,
    TuiInputModule,
    TuiInputYearModule,
    TuiButton,
    TuiComboBoxModule,
    TuiComboBoxModule,
    ReactiveFormsModule,
    TuiTextfieldControllerModule,
    TuiDataListWrapper,
    TuiStringifyContentPipe,
    TuiFilterByInputPipe,
    TuiMultiSelectModule,
    ReactiveFormsModule,
    TuiTextfieldControllerModule,
    TuiDataListWrapper,
    TuiDataList,
  ],
  templateUrl: "./station-form.component.html",
  styleUrl: "./station-form.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: TUI_VALIDATION_ERRORS,
      useValue: {
        required: "This field is required",
        pattern: "Enter correct coordinates",
      }
    }
  ],
})
export class StationFormComponent implements OnInit {
  private readonly stationsService = inject(StationsService);
  private readonly dialogs = inject(TuiDialogService);
  private readonly coordsPattern = /^-?\d+(\.\d+)?$/;
  private stations: StationType[] = [];
  protected search: string | null = "";
  selectedStation = this.stationsService.selectedStation$;

  private confirmData: TuiConfirmData = {
    yes: "Yes",
    no: "No",
  };

  ngOnInit(): void {
    this.stationsService.stations$.subscribe((stations) => {
      this.stations = stations;
    });
  }

  readonly cityForm = new FormGroup({
    city: new FormControl("", { validators: [Validators.required], nonNullable: true }),
    lng: new FormControl(
      "",
      { validators: [Validators.required, Validators.pattern(this.coordsPattern)], nonNullable: true }
    ),
    lat: new FormControl(
      "",
      { validators: [Validators.required, Validators.pattern(this.coordsPattern)], nonNullable: true }
    ),

    relations: new FormControl([], { validators: [Validators.required], nonNullable: true }),
  });

  deleteStation(station: StationType): void {
    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
      label: `Delete ${station.city}?`,
      size: "s",
      data: this.confirmData,
    })
      .pipe(
        filter((response) => response),
      )
      .subscribe(
        () => { this.stationsService.deleteStation(station.id); }
      );
  }

  createStation(): void {
    const {
      city, lng, lat, relations
    } = this.cityForm.getRawValue();

    const isExist = this.stationsService.isStationExist(city, lng, lat);
    if (isExist) {
      this.dialogs.open("A station with such coordinates or name already exists")
        .subscribe();
      return;
    }

    this.stationsService.createStation(city, +lng, +lat, relations);
  }

  @tuiPure
  protected filter(search: string | null): readonly string[] {
    return this.stations.map((station) => station.city)
      .filter((item) => TUI_DEFAULT_MATCHER(item, search || ""));
  }
}
