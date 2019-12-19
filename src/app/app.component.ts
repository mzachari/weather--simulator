import { Component, OnInit } from '@angular/core';
import {} from 'googlemaps';
import * as io from 'socket.io-client';
declare const google: any;
import { MapsAPILoader } from '@agm/core';
import { AppService } from './app.service';
import { TouchSequence } from 'selenium-webdriver';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'weather-api-simulator';
  precipitationVal = 0;
  lat = 20.59555464122044;
  lng = 77.59626583204385;
  drawingManager: any;
  selectedShape: any;
  farmCoords: { lat: number; lng: number }[] = []; // selected coordinates
  farmArea = 0;
  farmLocations: Array<google.maps.LatLng>[] = [];
  disabled = true;
  farmsList: any[] = [];
  farmsListLoaded = false;
  public socket = io('http://localhost:8888');
  constructor(private mapsAPILoader: MapsAPILoader, private appService: AppService) {}

  ngOnInit() {
    this.appService.getAllFarms();
    this.appService.getFarmsListUpdateListener().subscribe(farmsList => {
      this.farmsList =  farmsList.farms;

      this.mapsAPILoader.load().then(() => {
        for (const farm of this.farmsList) {
          const farmRegion = [];
          for (const point of farm.polygonPoints.coordinates ) {
            farmRegion.push(new google.maps.LatLng(point[0][0], point[1][0]));
          }
          this.farmLocations.push(farmRegion);
        }
        console.log(this.farmLocations);
        this.farmsListLoaded = true;
      });
   });
  }
  onMapReady(map) {
    this.initDrawingManager(map);
  }

  deleteSelectedShape() {
    if (this.selectedShape) {
      this.selectedShape.setMap(null);
      this.farmArea = 0;
      this.farmCoords = [];
      // To show:
      this.drawingManager.setOptions({
        drawingControl: true
      });
      this.disabled = true;
    }
  }
  clearSelection() {
    if (this.selectedShape) {
      this.selectedShape.setEditable(false);
      this.selectedShape = null;
      this.farmCoords = [];
    }
  }
  setSelection(shape) {
    this.clearSelection();
    this.selectedShape = shape;
    shape.setEditable(true);
  }

  initDrawingManager = (map: any) => {

      // this.farmLocations = [
      //   [
      //     new google.maps.LatLng(12.910869789073772, 77.59626583204385),
      //     new google.maps.LatLng(12.910671094624115, 77.59627119646188),
      //     new google.maps.LatLng(12.910739069058868, 77.59634898052332)
      //   ],
      //   [
      //     new google.maps.LatLng(20.59555464122044, 78.96616871828292),
      //     new google.maps.LatLng(20.59340539793349, 78.96599705690596),
      //     new google.maps.LatLng(20.593847300896442, 78.96719868654463),
      //     new google.maps.LatLng(20.59472105980361, 78.96691973680709)
      //   ]
      // ];
    const self = this;
    console.log(self);
    const options = {
      drawingControl: true,
      drawingControlOptions: {
        drawingModes: ['polygon']
      },
      polygonOptions: {
        draggable: true,
        editable: true
      },
      drawingMode: google.maps.drawing.OverlayType.POLYGON
    };
    this.drawingManager = new google.maps.drawing.DrawingManager(options);
    this.drawingManager.setMap(map);
    google.maps.event.addListener(
      this.drawingManager,
      'overlaycomplete',
      event => {
        if (event.type === google.maps.drawing.OverlayType.POLYGON) {
          const paths = event.overlay.getPaths();
          for (let p = 0; p < paths.getLength(); p++) {
            google.maps.event.addListener(paths.getAt(p), 'set_at', function() {
              if (!event.overlay.drag) {
                console.log('triggered 1!');
                self.farmCoords = [];
                const len = event.overlay.getPath().getLength();
                for (let i = 0; i < len; i++) {
                  self.farmCoords.push(
                    event.overlay
                      .getPath()
                      .getAt(i)
                      .toJSON()
                  );
                }
                self.farmArea = google.maps.geometry.spherical.computeArea(
                  event.overlay.getPath()
                );

                console.log(self.farmCoords, self.farmArea);
              }
            });
            google.maps.event.addListener(
              paths.getAt(p),
              'insert_at',
              function() {
                console.log('triggered 2!');
                self.farmCoords = [];
                const len = event.overlay.getPath().getLength();
                for (let i = 0; i < len; i++) {
                  self.farmCoords.push(
                    event.overlay
                      .getPath()
                      .getAt(i)
                      .toJSON()
                  );
                }
                self.farmArea = google.maps.geometry.spherical.computeArea(
                  event.overlay.getPath()
                );
                console.log(self.farmCoords, self.farmArea);
              }
            );
            google.maps.event.addListener(
              paths.getAt(p),
              'remove_at',
              function() {
                console.log('triggered 3!');
                self.farmCoords = [];
                const len = event.overlay.getPath().getLength();
                for (let i = 0; i < len; i++) {
                  self.farmCoords.push(
                    event.overlay
                      .getPath()
                      .getAt(i)
                      .toJSON()
                  );
                }
                self.farmArea = google.maps.geometry.spherical.computeArea(
                  event.overlay.getPath()
                );
                console.log(self.farmCoords, self.farmArea);
              }
            );
          }
          console.log('if1');
          self.farmCoords = [];
          const len = event.overlay.getPath().getLength();
          for (let i = 0; i < len; i++) {
            self.farmCoords.push(
              event.overlay
                .getPath()
                .getAt(i)
                .toJSON()
            );
          }
          self.farmArea = google.maps.geometry.spherical.computeArea(
            event.overlay.getPath()
          );
          self.disabled = false;
          console.log(self.farmCoords, self.farmArea);
        }
        if (event.type !== google.maps.drawing.OverlayType.MARKER) {
          console.log('if2');
          // Switch back to non-drawing mode after drawing a shape.
          this.drawingManager.setDrawingMode(null);
          // To hide:
          this.drawingManager.setOptions({
            drawingControl: false
          });
          // Add an event listener that selects the newly-drawn shape when the user
          // mouses down on it.
          const newShape = event.overlay;
          newShape.type = event.type;
          google.maps.event.addListener(newShape, 'click', () => {
            this.setSelection(newShape);
          });
          this.setSelection(newShape);
        }
      }
    );
  }
  private setCurrentPosition() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
      });
    }
  }

  /// Add you code here
  simulatePrecipitation() {
    const simulatedRegion =  this.farmCoords.map(point => {
      return [
        point.lat,
        point.lng
      ];
    });
    console.log(simulatedRegion, this.precipitationVal);
    this.socket.emit('drought', simulatedRegion, 'precipitation', this.precipitationVal);
  }
  simulateDrought() {

    const simulatedRegion =  this.farmCoords.map(point => {
      return [
        point.lat,
        point.lng
      ];
    });
    this.socket.emit('drought', simulatedRegion, 'drought', 0);

  }
}
