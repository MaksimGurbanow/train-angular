import {
  AsyncPipe, DatePipe, NgForOf, NgIf
} from "@angular/common";
import {
  ChangeDetectionStrategy, Component, computed, inject, OnInit,
  signal
} from "@angular/core";
import {
  FormBuilder, FormControl, FormsModule, ReactiveFormsModule,
  Validators
} from "@angular/forms";
import { TuiDay, TuiLet } from "@taiga-ui/cdk";
import {
  TuiButton,
  TuiIcon,
  TuiIconPipe,
  TuiLoader,
  TuiNotification,
  TuiTextfieldOptionsDirective,
} from "@taiga-ui/core";
import {
  TuiDataListWrapper,
  TuiDataListWrapperComponent,
  TuiFieldErrorPipe,
  tuiInputDateOptionsProvider,
  TuiRadioList,
  TuiTabs
} from "@taiga-ui/kit";
import {
  TuiComboBoxModule,
  TuiInputDateModule,
  TuiInputDateTimeModule,
  TuiInputModule,
  TuiTextfieldControllerModule,
  TuiUnfinishedValidator,
} from "@taiga-ui/legacy";
import { BehaviorSubject, filter, withLatestFrom } from "rxjs";

import { Route, Station } from "../../../../types";
import { day } from "../../../../utils/constants";
import { StationType } from "../../../features/admin/models/station.model";
import { StationsService } from "../../../features/admin/services/stations.service";
import { TripItemComponent } from "../../components/trip-item/trip-item.component";
import { SearchService } from "../../services/search.service";

@Component({
  selector: "app-home-page",
  standalone: true,
  exportAs: "Example6",
  imports: [
    TuiInputDateModule,
    ReactiveFormsModule,
    TuiTextfieldControllerModule,
    TuiRadioList,
    FormsModule,
    TuiInputDateTimeModule,
    TuiInputModule,
    TuiComboBoxModule,
    TuiTextfieldOptionsDirective,
    TuiDataListWrapperComponent,
    TuiDataListWrapper,
    TuiInputDateModule,
    TuiNotification,
    TuiFieldErrorPipe,
    AsyncPipe,
    TuiUnfinishedValidator,
    TuiInputDateModule,
    TuiLet,
    TuiButton,
    TuiLoader,
    TuiIcon,
    TuiIconPipe,
    NgForOf,
    NgIf,
    TuiTabs,
    DatePipe,
    TripItemComponent,
  ],
  templateUrl: "./home-page.component.html",
  styleUrl: "./home-page.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [tuiInputDateOptionsProvider({ nativePicker: true })],
})
export class HomePageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly stationsService = inject(StationsService);
  private readonly searchService = inject(SearchService);

  readonly stations$ = this.stationsService.stations$;
  readonly isLoading$ = this.stationsService.isLoading$;

  readonly searchFrom$ = new BehaviorSubject<string>("");
  readonly searchTo$ = new BehaviorSubject<string>("");

  private readonly countriesFrom$$ = new BehaviorSubject<StationType[]>([]);
  readonly countriesFrom$ = this.countriesFrom$$.asObservable();

  private readonly countriesTo$$ = new BehaviorSubject<StationType[]>([]);
  readonly countriesTo$ = this.countriesTo$$.asObservable();

  readonly trips = signal<Route[]>([]);

  public fromStation = signal<Station | null>(null);
  public toStation = signal<Station | null>(null);

  protected activeItemDate = signal(0);
  protected open = false;

  // TODO: move into separate function the filter callback
  protected filteredTrips = computed<Route[]>(
    () => this.trips()
      .filter((trip) => {
        const fromStationIndex = trip.path.findIndex(
          (p) => p === this.fromStation()?.stationId
        );
        return trip.schedule.some((sched) => {
          const departureTime = new Date(
            sched.segments[fromStationIndex].time[0]
          ).getTime();
          return departureTime >= this.activeItemDate()
            && departureTime < this.activeItemDate() + day;
        });
      }).map((trip) => ({
        ...trip,
        schedule: trip.schedule.filter((sched) => {
          const fromStationIndex = trip.path.findIndex(
            (p) => p === this.fromStation()?.stationId
          );
          const departureTime = new Date(
            sched.segments[fromStationIndex].time[0]
          ).getTime();
          return departureTime >= this.activeItemDate()
          && departureTime < this.activeItemDate() + day;
        })
      }))
  );

  readonly searchForm = this.fb.group({
    from: new FormControl<StationType | null>(null, [Validators.required]),
    to: new FormControl<StationType | null>(null, [Validators.required]),
    dateValue: new FormControl<TuiDay | null>(null),
  });

  public filterDates = signal<Date[]>([]);

  protected activeItemIndex = computed<number>(() => this.filterDates().findIndex(
    (filterDate) => filterDate.getTime() === this.activeItemDate()
  ));

  ngOnInit() {
    this.stationsService.getStations();

    this.stations$.subscribe((stations) => {
      this.countriesFrom$$.next(stations);
    });

    this.stations$.subscribe((stations) => {
      this.countriesTo$$.next(stations);
    });

    this.searchFrom$
      .pipe(
        filter((value) => value !== null),
        withLatestFrom(this.stations$)
      )
      .subscribe(([searchValue, stations]) => {
        const filteredStations = stations
          .filter((station) => station.city.toLowerCase().includes(searchValue.toLowerCase()));

        this.countriesFrom$$.next(filteredStations);
      });
  }

  // private isFuture(): boolean {
  //   if (this.searchForm.get("dateValue") && this.searchForm.get("dateValue")?.value) {
  //     return new Date((this.searchForm.get("dateValue")?.value as TuiDay).toUtcNativeDate()).getTime() > Date.now();
  //   }
  //   return true;
  // }

  protected onFromSearchChange(searchQuery: string | null): void {
    if (!searchQuery) return;
    this.searchFrom$.next(searchQuery);
  }

  protected extractValueFromEvent(event: Event): string | null {
    return (event.target as HTMLInputElement)?.value || null;
  }

  protected setFilterDate(time: number) {
    this.activeItemDate.set(time);
  }

  scrollRight() {
    const dates = this.filterDates();
    if (this.activeItemIndex() >= this.filterDates().length - 1) {
      const newDate = new Date(dates[dates.length - 1].getTime() + day);
      this.filterDates.set(dates.concat(newDate));
    }
    this.activeItemDate.set(this.activeItemDate() + day);
  }

  scrollLeft() {
    const dates = this.filterDates();
    if (this.activeItemIndex() === 0) {
      const newDate = (new Date(dates[0].getTime() - day));
      this.filterDates.set([newDate].concat(dates));
    }
    this.activeItemDate.set(this.activeItemDate() - day);
  }

  formSubmitHandler() {
    if (this.searchForm.valid) {
      const fromStation = this.searchForm.get("from")?.value;
      const toStation = this.searchForm.get("to")?.value;
      const time = this.searchForm.get("dateValue")?.value?.toUtcNativeDate().getTime();
      this.searchService.searchCity(
        {
          longitude: fromStation?.longitude || 0,
          latitude: fromStation?.latitude || 0,
        },
        {
          longitude: toStation?.longitude || 0,
          latitude: toStation?.latitude || 0,
        },
        time || 0
      ).subscribe({
        next: (value) => {
          this.trips.set(value.routes);
          this.fromStation.set(value.from);
          this.toStation.set(value.to);
          this.filterDates.set(
            Array.from({ length: 4 }).map((_, index) => new Date(
              (this.searchForm.get("dateValue")?.value?.toUtcNativeDate() || new Date(new Date().setHours(0, 0, 0, 0)))
                .getTime() + (day * index)
            ))
          );
          this.activeItemDate.set(this.searchForm.get("dateValue")?.value?.toUtcNativeDate().getTime()
            || new Date().setHours(0, 0, 0, 0));
        }
      });
    }
  }

  switchRoutes() {
    const from = this.searchForm.get("from")?.value || null;
    const to = this.searchForm.get("to")?.value || null;
    this.searchForm.setValue({ dateValue: this.searchForm.get("dateValue")!.value, from: to, to: from });
  }
}
