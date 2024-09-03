import { Routes } from "@angular/router";

import { AdminGuard } from "./core/auth/admin.guard";
import { AuthGuard } from "./core/auth/auth.guard";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./core/pages/home-page/home-page.component")
      .then((m) => m.HomePageComponent)
  },
  {
    path: "sign-in",
    loadComponent: () => import(
      "./features/authorization/components/sign-in/sign-in.component"
    ).then((m) => m.SignInComponent),
  },

  {
    path: "sign-up",
    loadComponent: () => import(
      "./features/authorization/components/sign-up/sign-up.component"
    ).then((m) => m.SignUpComponent),
  },

  {
    path: "admin",
    loadComponent: () => import("./features/admin/pages/admin-page/admin-page.component").then(
      (m) => m.AdminPageComponent
    ),
    canActivate: [AdminGuard],
  },
  {
    path: "profile",
    loadComponent: () => import(
      "./features/profile/pages/profile-page/profile-page.component"
    ).then((m) => m.ProfileComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "trip/:rideId",
    loadComponent: () => import(
      "./core/pages/search-detail/search-detail.component"
    ).then((m) => m.SearchDetailComponent),
  },
  {
    path: "order",
    loadComponent: () => import(
      "./features/order/pages/order-page/order-page.component"
    ).then((m) => m.OrderPageComponent),
    canActivate: [AuthGuard],
  }
];
