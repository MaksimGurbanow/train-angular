import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideRouter } from "@angular/router";
import { NG_EVENT_PLUGINS } from "@taiga-ui/event-plugins";

import { routes } from "./app.routes";
import { tokenInterceptor } from "./core/interceptors/token.interceptor";

export const appConfig: ApplicationConfig = {
  providers:
    [provideAnimations(),
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(routes),
      NG_EVENT_PLUGINS,
      provideHttpClient(withInterceptors([tokenInterceptor]))
    ]
};
