import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Sermon } from '../models/Sermon';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SermonsService {
  private apiUrl = 'assets/sermons.json';
  // private apiUrl = 'https://sermonsilsa.mecasite.com/api/sermons/last';

  constructor(private http: HttpClient) {}

  getSermons(): Observable<Sermon[]> {
    return this.http.get<Sermon[]>(this.apiUrl);
  }

  addSermon(sermon: Sermon): Observable<Sermon> {    
    return of(sermon);
  }

  updateSermon(sermon: Sermon): Observable<Sermon> {    
    return of(sermon);
  }

  deleteSermon(id: number): Observable<void> {
    return of(void 0);
  }
}
