import { AsyncPipe } from "@angular/common";
import { Component, inject } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import {TuiButton, TuiLink} from "@taiga-ui/core";

import { AuthService } from "../../features/authorization/services/auth.service";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [TuiLink, RouterLink, AsyncPipe, TuiButton],
  template: `

    <a
      tuiLink
      [routerLink]="['']"
    >
      Home
    </a>

    <a
      tuiLink
      [routerLink]="['admin']"
    >
      Admin
    </a>

    <a
      tuiLink
      [routerLink]="['profile']"
    >
      Profile
    </a>
    <a
      tuiLink
      [routerLink]="['order']"
    >
      Order
    </a>

    @if (token$ | async) {
      <button tuiButton (click)="logout()" appearance="outline">Logout</button>
    } @else {
      <div class="signInUpContainer">
        <a
          tuiLink
          [routerLink]="['sign-in']"
        >
          sign in
        </a>

        <a
          tuiLink
          [routerLink]="['sign-up']"
        >
          sign up
        </a>
      </div>
    }



  `,
  styleUrl: "./header.component.scss"
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly token$ = this.authService.token$;

  logout() {
    this.authService.logout();
    this.router.navigate(["/"]);
  }
}
