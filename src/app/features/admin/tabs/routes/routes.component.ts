import { AsyncPipe, SlicePipe } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { TuiButton, TuiLoader } from "@taiga-ui/core";
import { TuiPagination } from "@taiga-ui/kit";

import { RidesComponent } from "../../components/rides/rides.component";
import { RouteComponent } from "../../components/route/route.component";
import { RouteFormComponent } from "../../components/route-form/route-form.component";
import { RouteType } from "../../models/route.module";
import { CarriageService } from "../../services/carriage.service";
import { RoutesService } from "../../services/routes.service";
import { StationsService } from "../../services/stations.service";

@Component({
  selector: "app-routes",
  standalone: true,
  imports: [
    AsyncPipe,
    TuiLoader,
    RouteFormComponent,
    RouteComponent,
    SlicePipe,
    TuiButton,
    TuiPagination,
    RidesComponent,
  ],
  templateUrl: "./routes.component.html",
  styleUrl: "./routes.component.scss"
})
export class RoutesComponent implements OnInit {
  private readonly routesService = inject(RoutesService);
  private readonly carriageService = inject(CarriageService);
  private readonly stationsService = inject(StationsService);

  readonly isLoading$ = this.routesService.isLoading$;
  readonly routes$ = this.routesService.routes$;

  routeId: number | null = null;

  routeForEditing: RouteType | null = null;
  isFormOpen: boolean = false;

  paginationLength = 100;
  paginationIndex = 0;

  protected goToPage(index: number): void {
    this.paginationIndex = index;
  }

  ngOnInit(): void {
    this.routesService.getRoutes();
    this.carriageService.getCarriages();
    this.stationsService.getStations();

    this.routes$.subscribe((routes) => {
      this.paginationLength = Math.ceil(routes.length / 5);
    });
  }

  onEditRoute(route: RouteType): void {
    this.isFormOpen = true;
    this.routeForEditing = route;
  }

  onCreateRouteHandler() {
    this.isFormOpen = true;
    this.routeForEditing = null;
  }

  onCLoseFormHandler() {
    this.isFormOpen = false;
  }

  setRouteId(id: number | null) {
    this.routeId = id;
  }
}
