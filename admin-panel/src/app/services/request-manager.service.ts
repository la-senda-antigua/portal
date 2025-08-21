import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RequestManagerService {
  get accessToken(): string {
    return localStorage.getItem('access-token') || '';
  }

  get headers(): {
    [key: string]: string;
  } {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.accessToken}`,
    };
  }

  get apiBaseUrl(): string {
    return environment.apiBaseUrl;
  }

  constructor(private httpClient: HttpClient) {}

  get<T>(url: string) {
    return this.httpClient.get<T>(`${this.apiBaseUrl}${url}`, { headers: this.headers });
  }

  post<T>(url: string, body: any) {
    return this.httpClient.post<T>(`${this.apiBaseUrl}${url}`, body, { headers: this.headers });
  }

  put<T>(url: string, body: any){
    return this.httpClient.put<T>(`${this.apiBaseUrl}${url}`, body, { headers: this.headers });
  }

  delete<T>(url: string){
    return this.httpClient.delete<T>(`${this.apiBaseUrl}${url}`, { headers: this.headers });
  }
}
