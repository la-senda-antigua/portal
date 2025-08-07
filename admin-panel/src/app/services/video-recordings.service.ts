import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Preacher } from '../models/Preacher';
import { Sermon, SermonDto } from '../models/Sermon';
import { TableResult } from '../models/TableResult';
import { VideoPlaylist } from '../models/VideoPlaylist';
import { RequestManagerService } from './request-manager.service';
import { GalleryVideo } from '../models/GalleryVideo';

@Injectable({
  providedIn: 'root',
})
export class VideoRecordingsService {
  private apiSermonsUrl = '/sermons';
  private apiCoursesUrl = '/lessons'; 
  private apiGalleryUrl = '/gallery'; 
  private apiPreachersUrl = '/preachers';
  private apiPlaylistsUrl = '/videoplaylist';

  constructor(private requestManager: RequestManagerService) {}

  //sermons section
  getSermons(page: number=1, pageSize: number=10): Observable<TableResult<Sermon>> {
    const url :string = `${this.apiSermonsUrl}?page=${page}&pageSize=${pageSize}`;
    return this.requestManager.get<TableResult<Sermon>>(url);    
  }

  addSermon(sermon: SermonDto): Observable<SermonDto> {    
    return this.requestManager.post<SermonDto>(this.apiSermonsUrl, sermon);
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
  
  //gallery section
  getGalleryVideos(page: number=1, pageSize: number=10): Observable<TableResult<GalleryVideo>> {
    const url :string = `${this.apiGalleryUrl}?page=${page}&pageSize=${pageSize}`;
    return this.requestManager.get<TableResult<GalleryVideo>>(url);
  }

  addGalleryVideo(course: GalleryVideo): Observable<GalleryVideo> {
    return this.requestManager.post<GalleryVideo>(this.apiGalleryUrl, course);
  }

  updateGalleryVideo(course: GalleryVideo): Observable<GalleryVideo> {
    const url: string = `${this.apiGalleryUrl}/${course.id}`;
    return this.requestManager.put<GalleryVideo>(url, course);
  }

  deleteGalleryVideo(id: number): Observable<void> {
    const url: string = `${this.apiGalleryUrl}/${id}`;
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

  //#region video playlists
  getAllPlaylists(): Observable<VideoPlaylist[]> {
    return this.requestManager.get<VideoPlaylist[]>(this.apiPlaylistsUrl);
  }

  addPlaylist(playlist: VideoPlaylist): Observable<VideoPlaylist> {
    return this.requestManager.post<VideoPlaylist>(this.apiPlaylistsUrl, playlist);
  }

  updatePlaylist(playlist: VideoPlaylist): Observable<VideoPlaylist> {
    const url = `${this.apiPlaylistsUrl}/${playlist.id}`;
    return this.requestManager.put<VideoPlaylist>(url, playlist);
  }

  deletePlaylist(id: string): Observable<void> {
    return this.requestManager.delete<void>(`${this.apiPlaylistsUrl}/${id}`);
  }
  //#endregion
}
