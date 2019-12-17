import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AgmCoreModule } from '@agm/core';
import { HttpClientModule } from '@angular/common/http';
import { AngularMaterialModule } from './app-material.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDA8C5ajxqNc_umQDsU1wHlWf70ZQoOWsE',
      libraries: ['places', 'drawing', 'geometry']
    }),
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AngularMaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
