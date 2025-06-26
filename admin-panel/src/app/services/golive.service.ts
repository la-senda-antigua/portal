import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GoliveService {
  constructor(private httpClient: HttpClient) {}

  goLive() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.httpClient.post(`${environment.apiBaseUrl}/LSAService/start`, {
      headers,
    });
  }

  goOffline(){
    
  }
}
