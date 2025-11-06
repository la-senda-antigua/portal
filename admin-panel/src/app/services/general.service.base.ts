import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RequestManagerService } from './request-manager.service';
@Injectable({
  providedIn: 'root',
})
export class GeneralServiceBase {
  apiUrl = '';
  constructor(public requestManager: RequestManagerService) {}
  getPage(a: number, b: number): Observable<any> {
    return of(null);
  }
  getMyPage(a: number, b: number): Observable<any> {
    return of(null);
  }
  getAll(): Observable<any[]> {
    return of([]);
  }
  search(a: string, b:number, c:number): Observable<any> {
    return of(null);
  }
  edit(arg: any): Observable<any> {
    return of(null);
  }
  delete(arg: any): Observable<any> {
    return of(null);
  }
  disable(arg: any, arg2: any): Observable<any> {
    return of(null);
  }
  add(arg: any): Observable<any> {
    return of(null);
  }
  addWithImage(arg: any): Observable<any> {
    return of(null);
  }
  editWithImage(id: any, args: any): Observable<any>{
    return of(null);
  }
}
