import { inject, Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { TuiAlertService } from "@taiga-ui/core";
import { map, Observable, take } from "rxjs";

import { AuthService } from "../../features/authorization/services/auth.service";

@Injectable({
  providedIn: "root"
})
export class AuthGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly token$ = this.authService.token$;

  canActivate(): Observable<boolean> {
    return this.token$.pipe(
      take(1),
      map((token) => {
        if (token) {
          return true;
        }
        this.router.navigate(["/sign-in"]);
        return false;
      })
    );
  }
}
