import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { TuiRoot } from "@taiga-ui/core";

import { AlertComponent } from "./shared/alert/alert.component";
import { HeaderComponent } from "./shared/header/header.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, AlertComponent, TuiRoot, HeaderComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss"
})
export class AppComponent {
  title = "Train-A";
}
