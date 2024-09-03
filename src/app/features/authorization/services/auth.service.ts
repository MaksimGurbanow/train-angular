import { HttpClient, HttpResponse } from "@angular/common/http";
import { computed, inject, Injectable } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { TuiAlertService } from "@taiga-ui/core";
import {
  BehaviorSubject, catchError, EMPTY, filter, of
} from "rxjs";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  private readonly httpClient = inject(HttpClient);
  private readonly alerts = inject(TuiAlertService);

  private readonly tokenSubject$$ = new BehaviorSubject<string>("");
  readonly token$ = this.tokenSubject$$.asObservable();

  private readonly isAdmin$$ = new BehaviorSubject<boolean>(false);
  readonly isAdmin$ = this.isAdmin$$.asObservable();

  private readonly authError$$ = new BehaviorSubject<string>("");
  readonly authError$ = this.authError$$.asObservable();

  private readonly router = inject(Router);

  public isLogined = computed(() => Boolean(this.tokenSubject$$.getValue()));

  constructor() {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.authError$$.next("");
    });
  }

  logout() {
    this.authError$$.next("");
    this.httpClient.delete("/api/logout", { observe: "response" }).subscribe({
      next: () => {
        this.tokenSubject$$.next("");
        this.router.navigate(["/"]);

        this.alerts.open(
          "",
          {
            label: "Successfully logged out",
            autoClose: 3000
          }
        ).subscribe();
      },
      error: (err) => {
        console.log(err);
      }
    });

    this.isAdmin$$.next(false);
    this.tokenSubject$$.next("");
  }

  signUp(email: string, password: string) {
    this.authError$$.next("");
    this.httpClient.post("/api/signup", { email, password }, { observe: "response" })
      .subscribe(
        {
          next: (response: HttpResponse<object>) => {
            if (response.status === 201) {
              this.authError$$.next("");
              this.router.navigate(["/sign-in"]);

              this.alerts.open(
                "",
                {
                  label: "Successfully registered",
                  autoClose: 3000
                }
              ).subscribe();
            }
          },
          error: (err) => {
            if (err.status === 400) {
              this.authError$$.next("user already exists");
            } else {
              this.authError$$.next("something went wrong");
            }
          }
        }
      );

    return true;
  }

  signIn(email: string, password: string) {
    this.authError$$.next("");
    this.httpClient.post<{ token: string }>("/api/signin", { email, password }, { observe: "response" })
      .subscribe(
        {
          next: (response) => {
            if (response.status === 201) {
              const token = response.body?.token;
              if (!token) return;
              this.tokenSubject$$.next(token);
              this.router.navigate(["/"]);

              this.isAdminCheck();

              this.alerts.open(
                "",
                {
                  label: "Successfully logged in",
                  autoClose: 3000
                }
              ).subscribe();
            }
          },
          error: (err) => {
            if (err.status === 400) {
              this.authError$$.next("invalid password or email");
            } else {
              this.authError$$.next("something went wrong");
            }
          },
        },
      );

    return true;
  }

  isAdminCheck() {
    return this.httpClient.get("/api/route/1").pipe(
      catchError(
        (e) => {
          if (e.status === 401) {
            this.isAdmin$$.next(false);
            return EMPTY;
          }
          return of("user");
        }
      )
    ).subscribe(
      () => {
        this.isAdmin$$.next(true);
      }
    );
  }
}
