import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RequestManagerService } from './request-manager.service';
@Injectable({
  providedIn: 'root',
})
export class VideosServiceBase {
  apiUrl = '';
  constructor(public requestManager: RequestManagerService) {}
  getAll(a:number, b:number): Observable<any> {
    return of(null);
  }
  edit(arg: any): Observable<any> {
    return of(null);
  }
  delete(arg: any): Observable<any> {
    return of(null);
  }
  add(arg: any): Observable<any> {
    return of(null);
  }
}
