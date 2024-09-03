import { NgForOf } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { GoogleMapsModule } from "@angular/google-maps";

import { MarkerType } from "../../models/station.model";
import { StationsService } from "../../services/stations.service";

@Component({
  selector: "app-map",
  standalone: true,
  imports: [GoogleMapsModule, NgForOf],
  template: `
    <google-map height="400px"
                width="400px"
                [options]="mapOptions">
      <map-marker *ngFor="let marker of markers"
                  [position]="marker.position"
                  (mapClick)="onMarkClickHandler(marker)"
      ></map-marker>
    </google-map>
  `,
})
export class MapComponent implements OnInit {
  private readonly adminService = inject(StationsService);

  private markers$ = this.adminService.markers$;
  mapOptions: google.maps.MapOptions = {
    center: { lat: 53, lng: 27 },
    zoom: 2,
  };

  markers: MarkerType[] = [];

  ngOnInit() {
    this.markers$.subscribe((markers) => {
      this.markers = markers;
    });
  }

  onMarkClickHandler(marker: MarkerType) {
    const { lat, lng } = marker.position;
    this.adminService.selectStationByCoordinates(lat, lng);
  }
}
