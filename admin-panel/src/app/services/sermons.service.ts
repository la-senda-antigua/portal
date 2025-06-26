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
  private apiCoursesUrl = environment.apiBaseUrl + '/api/lessons'; 
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
    const url = `${this.apiSermonsUrl}/${id}`;
    return this.http.delete<void>(url);    
  }

  //courses section
  getCourses(page: number=1, pageSize: number=10): Observable<TableResult<Sermon>> {
    const url :string = `${this.apiCoursesUrl}?page=${page}&pageSize=${pageSize}`;
    return this.http.get<TableResult<Sermon>>(url);
  }

  addCourse(course: Sermon): Observable<Sermon> {
    return this.http.post<Sermon>(this.apiCoursesUrl, course);
  }

  updateCourse(course: Sermon): Observable<Sermon> {
    const url: string = `${this.apiCoursesUrl}/${course.id}`;
    return this.http.put<Sermon>(url, course);
  }

  deleteCourse(id: number): Observable<void> {
    const url: string = `${this.apiCoursesUrl}/${id}`;
    return this.http.delete<void>(url);
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
    const url = `${this.apiPreachersUrl}/${preacher.id}`;
    return this.http.put<Preacher>(url, preacher);
  }

  deletePreacher(id: number): Observable<void> {
    const url = `${this.apiPreachersUrl}/${id}`;
    return this.http.delete<void>(url);
  }
}
