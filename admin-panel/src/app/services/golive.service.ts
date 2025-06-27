import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { RequestManagerService } from './request-manager.service';

export interface GoLiveResponse {
  isOn: boolean;
  endTime: Date;
  videoURL: string;
}

@Injectable({
  providedIn: 'root',
})
export class GoliveService {
  constructor(private requestManager: RequestManagerService) {}

  goLive(videoUrl: string) {
    return this.requestManager.post<GoLiveResponse>(
      '/LSAService/start',
      `"${videoUrl}"`
    );
  }

  goOffline() {
    return this.requestManager.post('/LSAService/end', {});
  }

  add30Minutes() {
    return this.requestManager.post<GoLiveResponse>(
      '/LSAService/add30mins',
      {}
    );
  }

  getLiveStatus() {
    return this.requestManager.get<GoLiveResponse>('/LSAService/status');
  }
}
