import { AsyncPipe, NgIf } from "@angular/common";
import { Component, inject } from "@angular/core";
import { TuiIcon, TuiIconPipe } from "@taiga-ui/core";

import { UserService } from "../../features/profile/services/user.service";

@Component({
  selector: "app-alert",
  standalone: true,
  styleUrl: "./alert.component.scss",
  imports: [AsyncPipe, TuiIcon, TuiIconPipe, NgIf],
  template: `
    <div class="alertWrapper" *ngIf="error">
      {{ error }}
      <button (click)="userService.clearError()">
        <tui-icon
          icon="@tui.material.outlined.close"
          [style.color]="'var(--tui-status-negative)'"
        />
      </button>
    </div>
  `,
})
export class AlertComponent {
  public userService = inject(UserService);
  public error = "";
  // constructor() {
  // this.userService.error.subscribe((value) => {
  //   this.error = value || "";
  // });
  // }
}
