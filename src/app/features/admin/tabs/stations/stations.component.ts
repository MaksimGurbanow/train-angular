import { AsyncPipe } from "@angular/common";
import { Component, inject, OnInit, } from "@angular/core";
import { TuiLoader } from "@taiga-ui/core";

import { MapComponent } from "../../components/map/map.component";
import { StationFormComponent } from "../../components/station-form/station-form.component";
import { StationsService } from "../../services/stations.service";

@Component({
  selector: "app-stations",
  standalone: true,
  imports: [MapComponent, StationFormComponent, AsyncPipe, TuiLoader],
  templateUrl: "./stations.component.html",
  styleUrl: "./stations.component.scss",
})
export class StationsComponent implements OnInit {
  private readonly adminService = inject(StationsService);
  public readonly isLoading$ = this.adminService.isLoading$;

  ngOnInit() {
    this.adminService.getStations();
  }
}
