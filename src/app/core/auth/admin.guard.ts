import { inject, Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { TuiAlertService } from "@taiga-ui/core";
import {
  combineLatest, map, Observable, take
} from "rxjs";

import { AuthService } from "../../features/authorization/services/auth.service";

@Injectable({
  providedIn: "root"
})
export class AdminGuard implements CanActivate {
  private readonly userService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly alerts = inject(TuiAlertService);

  private readonly isAdmin$ = this.userService.isAdmin$;
  private readonly token$ = this.userService.token$;

  canActivate(): Observable<boolean> {
    return combineLatest([this.token$, this.isAdmin$]).pipe(
      take(1),
      map(([token, isAdmin]) => {
        if (!token) {
          this.router.navigate(["/sign-in"]);
          return false;
        }

        if (isAdmin) {
          return true;
        }

        this.alerts.open(
          "",
          {
            label: "You are not an admin",
            autoClose: 3000,
          }
        ).subscribe();

        return false;
      })
    );
  }
}
