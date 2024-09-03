import { AsyncPipe, JsonPipe, SlicePipe } from "@angular/common";
import {
  Component, EventEmitter, inject, Input, OnChanges, Output
} from "@angular/core";
import { TuiButton } from "@taiga-ui/core";
import { BehaviorSubject, combineLatest } from "rxjs";

import { CarriageType } from "../../models/carriages.model";
import { RouteType } from "../../models/route.module";
import { StationType } from "../../models/station.model";
import { CarriageService } from "../../services/carriage.service";
import { RoutesService } from "../../services/routes.service";
import { StationsService } from "../../services/stations.service";

@Component({
  selector: "app-route",
  standalone: true,
  imports: [
    AsyncPipe,
    JsonPipe,
    SlicePipe,
    TuiButton,
  ],
  templateUrl: "./route.component.html",
  styleUrl: "./route.component.scss"
})
export class RouteComponent implements OnChanges {
  @Input() route!: RouteType;
  @Output() editRoute = new EventEmitter();
  @Output() setRouteId = new EventEmitter<number | null>();

  private readonly carriagesService = inject(CarriageService);
  private readonly stationsService = inject(StationsService);
  private readonly routesService = inject(RoutesService);

  private readonly carriages$ = this.carriagesService.carriages$;
  private readonly stations$ = this.stationsService.stations$;

  private readonly currentStations$$ = new BehaviorSubject<StationType[]>([]);
  readonly currentStations$ = this.currentStations$$.asObservable();

  private readonly currentCarriages$$ = new BehaviorSubject<CarriageType[]>([]);
  readonly currentCarriages$ = this.currentCarriages$$.asObservable();

  ngOnChanges() {
    combineLatest([this.carriages$, this.stations$]).subscribe(
      ([carriages, stations]) => {
        const currentStations = this.route.path.map((station) => stations.find((s) => s.id === station));
        const currentCarriages = this.route.carriages.map((carriage) => carriages.find((c) => c.code === carriage));

        this.currentStations$$.next(currentStations as StationType[]);
        this.currentCarriages$$.next(currentCarriages as CarriageType[]);
      }
    );
  }

  removeRoute() {
    this.routesService.removeRoute(this.route.id as number);
  }

  editRouteHandler() {
    this.editRoute.emit(this.route);

    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }

  setRouteIdHandler() {
    this.setRouteId.emit(this.route.id);
  }
}
