import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

const BACKEND_URL_FARMS = 'http://localhost:3000/api/farms/all';

@Injectable({ providedIn: 'root' })
export class AppService {
  farmsList: any[] = [];
  private farmsListUpdated = new Subject<{ farms: any[] }>();
  constructor(private http: HttpClient) {}
  getAllFarms() {
    this.http.get<{message: string, farms: any, farmerCount: number} > (BACKEND_URL_FARMS).subscribe((responseData) => {
      this.farmsList = responseData.farms.map(farm => {
        return {
          id: farm._id,
          ...farm
        };
      });
      this.farmsListUpdated.next({ farms: [...this.farmsList] });
    });
  }
  getFarmsListUpdateListener() {
    return this.farmsListUpdated.asObservable();
  }
}
