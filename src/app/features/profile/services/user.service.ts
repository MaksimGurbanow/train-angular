import { HttpClient, HttpResponse } from "@angular/common/http";
import { computed, inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, map } from "rxjs";

import { AuthService } from "../../authorization/services/auth.service";

export interface User {
  email: string;
  name: string;
  role: "manager" | "user";
}

@Injectable({
  providedIn: "root",
})
export class UserService {
  private authService = inject(AuthService);
  private httpClient = inject(HttpClient);
  private router = inject(Router);

  private readonly userProfileSubject = new BehaviorSubject<User | null>(null);
  public userProfile = this.userProfileSubject.asObservable();

  private readonly errorSubject$$ = new BehaviorSubject<string | null>(null);
  public error = this.errorSubject$$.asObservable();

  public isAdmin = computed(() => this.userProfileSubject.getValue()?.role === "manager");

  public getUser() {
    this.authService.token$.subscribe(() => {
      this.httpClient.get("/api/profile", { observe: "response" }).subscribe({
        next: (response: HttpResponse<object>) => {
          if (response.status === 200) {
            this.userProfileSubject.next(response.body as User);
          }
        },
        error: (err) => {
          this.router.navigate(["/"]);
          this.errorSubject$$.next(`${err.status}: ${err.error.message}`);
        },
      });
    });
  }

  public logout() {
    this.authService.logout();
  }

  public updateUser(user: Partial<User>) {
    this.httpClient
      .put(
        "/api/profile",
        { ...this.userProfileSubject.getValue(), ...user },
        { observe: "response" }
      )
      .pipe(
        map((response: HttpResponse<object>) => {
          console.log(response);
          if (response.status === 200) {
            this.userProfileSubject.next(response.body as User);
          }
        })
      )
      .subscribe({
        next: () => console.log("User updated successfully"),
        error: (err) => {
          console.log("Failed to update user", err);
          this.errorSubject$$.next(`${err.status}: ${err.error.message}`);
        },
      });
  }

  public updatePassword(password: string) {
    return this.httpClient
      .put("/api/profile/password", { password }, { observe: "response" })
      .subscribe({
        next: (value) => console.log(value),
        error: (err) => {
          console.log(err);
          this.errorSubject$$.next(`${err.status}: ${err.error.message}`);
        },
      });
  }

  public clearError() {
    this.errorSubject$$.next("");
  }
}
