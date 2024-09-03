import { AsyncPipe } from "@angular/common";
import { Component } from "@angular/core";
import { TuiLoader } from "@taiga-ui/core";
import { TuiTabs } from "@taiga-ui/kit";

import { CarriagesComponent } from "../../tabs/carriages/carriages.component";
import { RoutesComponent } from "../../tabs/routes/routes.component";
import { StationsComponent } from "../../tabs/stations/stations.component";

@Component({
  selector: "app-admin-page",
  standalone: true,
  imports: [
    TuiTabs,
    CarriagesComponent,
    StationsComponent,
    AsyncPipe,
    TuiLoader,
    RoutesComponent,
  ],
  templateUrl: "./admin-page.component.html",
  styleUrl: "./admin-page.component.scss"
})
export class AdminPageComponent {
  protected activeItemIndex = 0;
}
