import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { Route } from "../../../types";

export interface SearchResponse {
  from: {
    stationId: number;
    city: string;
    geolocation: { latitude: number; longitude: number };
  };
  to: {
    stationId: number;
    city: string;
    geolocation: { latitude: number; longitude: number };
  };
  routes: Route[];
}

@Injectable({
  providedIn: "root",
})
export class SearchService {
  private apiUrl = "/api/search/"; // API

  constructor(private http: HttpClient) {}

  searchCity(
    from: { latitude: number; longitude: number },
    to: { latitude: number; longitude: number },
    time?: number
  ): Observable<SearchResponse> {
    const params = new HttpParams()
      .set("fromLatitude", from.latitude)
      .set("fromLongitude", from.longitude)
      .set("toLatitude", to.latitude)
      .set("toLongitude", to.longitude)
      .set("time", time || 0);

    return this.http.get<SearchResponse>(this.apiUrl, { params });
  }
}
