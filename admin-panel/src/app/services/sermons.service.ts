import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Sermon } from '../models/Sermon';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { TableResult } from '../models/TableResult';
import { Preacher } from '../models/Preacher';

@Injectable({
  providedIn: 'root',
})
export class SermonsService {
  private apiSermonsUrl = environment.apiBaseUrl + '/api/sermons';
  private apiCoursesUrl = environment.apiBaseUrl + '/api/courses'; 
  private apiPreachersUrl = environment.apiBaseUrl + '/api/preachers';

  constructor(private http: HttpClient) {}

  //sermons section
  getSermons(page: number=1, pageSize: number=10): Observable<TableResult<Sermon>> {
    const url :string = `${this.apiSermonsUrl}?page=${page}&pageSize=${pageSize}`;
    return this.http.get<TableResult<Sermon>>(url);
  }

  addSermon(sermon: Sermon): Observable<Sermon> {    
    return this.http.post<Sermon>(this.apiSermonsUrl, sermon);
  }

  updateSermon(sermon: Sermon): Observable<Sermon> {
    const url = `${this.apiSermonsUrl}/${sermon.id}`;
    return this.http.put<Sermon>(url, sermon);
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

  //preachers section
  getAllPreachers(): Observable<Preacher[]> {    
    return this.http.get<Preacher[]>(this.apiPreachersUrl + '/getAll');
  }

  getPreachers(page: number=1, pageSize: number=10): Observable<TableResult<Preacher>> {
    const url :string = `${this.apiPreachersUrl}?page=${page}&pageSize=${pageSize}`;
    return this.http.get<TableResult<Preacher>>(url);
  }

  addPreacehr(preacehr: Preacher): Observable<Preacher> {    
    return this.http.post<Preacher>(this.apiPreachersUrl, preacehr);    
  }

  updatePreacher(preacher: Preacher): Observable<Preacher> {
    return of(preacher);
  }

  deletePreacher(id: number): Observable<void> {
    return of(void 0);
  }
}
