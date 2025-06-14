import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Sermon } from '../models/Sermon';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SermonsService {
  private apiSermonsUrl = 'assets/sermons.json';
  private apiCoursesUrl = 'assets/sermons.json';
  // private apiSermonsUrl = 'https://sermonsilsa.mecasite.com/api/sermons/last';

  constructor(private http: HttpClient) {}

  //sermons section
  getSermons(): Observable<Sermon[]> {
    return this.http.get<Sermon[]>(this.apiSermonsUrl);
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

  //courses section
  getCourses(): Observable<Sermon[]> {
    return this.http.get<Sermon[]>(this.apiCoursesUrl);
  }

  addCourse(sermon: Sermon): Observable<Sermon> {
    return of(sermon);
  }

  updateCourse(sermon: Sermon): Observable<Sermon> {
    return of(sermon);
  }

  deleteCourse(id: number): Observable<void> {
    return of(void 0);
  }
}
