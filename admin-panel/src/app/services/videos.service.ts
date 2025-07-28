import { Injectable } from '@angular/core';
import { Sermon } from '../models/Sermon';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { TableResult } from '../models/TableResult';
import { Preacher } from '../models/Preacher';
import { RequestManagerService } from './request-manager.service';
import { Gallery } from '../models/Gallery';

@Injectable({
  providedIn: 'root',
})
export class VideosService {
  private apiSermonsUrl = '/sermons';
  private apiCoursesUrl = '/lessons'; 
  private apiPreachersUrl = '/preachers';
  private apiGalleryUrl = '/gallery';

  constructor(private requestManager: RequestManagerService) {}

  //sermons section
  getSermons(page: number=1, pageSize: number=10): Observable<TableResult<Sermon>> {
    const url :string = `${this.apiSermonsUrl}?page=${page}&pageSize=${pageSize}`;
    return this.requestManager.get<TableResult<Sermon>>(url);    
  }

  addSermon(sermon: Sermon): Observable<Sermon> {    
    return this.requestManager.post<Sermon>(this.apiSermonsUrl, sermon);
  }

  updateSermon(sermon: Sermon): Observable<Sermon> {
    const url = `${this.apiSermonsUrl}/${sermon.id}`;
    return this.requestManager.put<Sermon>(url, sermon);
  }

  deleteSermon(id: number): Observable<void> {
    const url = `${this.apiSermonsUrl}/${id}`;
    return this.requestManager.delete<void>(url);    
  }

  //courses section
  getCourses(page: number=1, pageSize: number=10): Observable<TableResult<Sermon>> {
    const url :string = `${this.apiCoursesUrl}?page=${page}&pageSize=${pageSize}`;
    return this.requestManager.get<TableResult<Sermon>>(url);
  }

  addCourse(course: Sermon): Observable<Sermon> {
    return this.requestManager.post<Sermon>(this.apiCoursesUrl, course);
  }

  updateCourse(course: Sermon): Observable<Sermon> {
    const url: string = `${this.apiCoursesUrl}/${course.id}`;
    return this.requestManager.put<Sermon>(url, course);
  }

  deleteCourse(id: number): Observable<void> {
    const url: string = `${this.apiCoursesUrl}/${id}`;
    return this.requestManager.delete<void>(url);
  }

  //preachers section
  getAllPreachers(): Observable<Preacher[]> {    
    return this.requestManager.get<Preacher[]>(this.apiPreachersUrl + '/getAll');
  }

  getPreachers(page: number=1, pageSize: number=10): Observable<TableResult<Preacher>> {
    const url :string = `${this.apiPreachersUrl}?page=${page}&pageSize=${pageSize}`;
    return this.requestManager.get<TableResult<Preacher>>(url);
  }

  addPreacher(preacehr: Preacher): Observable<Preacher> {    
    return this.requestManager.post<Preacher>(this.apiPreachersUrl, preacehr);    
  }

  updatePreacher(preacher: Preacher): Observable<Preacher> {
    const url = `${this.apiPreachersUrl}/${preacher.id}`;
    return this.requestManager.put<Preacher>(url, preacher);
  }

  deletePreacher(id: number): Observable<void> {
    const url = `${this.apiPreachersUrl}/${id}`;
    return this.requestManager.delete<void>(url);
  }

  //gallery section
  getGallery(page: number=1, pageSize: number=10): Observable<TableResult<Gallery>> {
    const url :string = `${this.apiGalleryUrl}?page=${page}&pageSize=${pageSize}`;
    return this.requestManager.get<TableResult<Gallery>>(url);
  }
  addGalleryItem(item: Gallery): Observable<Gallery> {
    return this.requestManager.post<Gallery>(this.apiGalleryUrl, item);
  }
  updateGalleryItem(item: Gallery): Observable<Gallery> {
    const url = `${this.apiGalleryUrl}/${item.id}`;
    return this.requestManager.put<Gallery>(url, item);
  }
  deleteGalleryItem(id: number): Observable<void> {
    const url = `${this.apiGalleryUrl}/${id}`;
    return this.requestManager.delete<void>(url);
  }
  
}
