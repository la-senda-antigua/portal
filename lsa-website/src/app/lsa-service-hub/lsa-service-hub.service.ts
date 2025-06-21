import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';

const LSAServiceHub_ServiceStartedNotification = 'service-started';
const LSAServiceHub_ServiceEndedNotification = 'service-ended';

export interface LSAServiceHubNotification {
  isServiceOn: boolean;
  videoUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class LsaServiceHubService {
  private hubConnection: signalR.HubConnection;
  private baseUrl = window.location.origin.includes('localhost')
    ? 'http://localhost:5089'
    : window.location.origin.includes('testing')
    ? 'https://testing-api.iglesialasendaantigua.com'
    : 'https://api.iglesialasendaantigua.com';

  readonly liveServiceState = signal<LSAServiceHubNotification>({
    isServiceOn: false,
    videoUrl: '',
  });

  constructor() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.baseUrl + '/lsa-service-hub')
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('LSAServiceHub Connection started'))
      .catch((err) => console.error('Error while starting connection: ' + err));

    this.hubConnection.on(
      LSAServiceHub_ServiceStartedNotification,
      (videoUrl) => {
        this.liveServiceState.set({ isServiceOn: true, videoUrl });
      }
    );

    this.hubConnection.on(LSAServiceHub_ServiceEndedNotification, () =>
      this.liveServiceState.set({ isServiceOn: false, videoUrl: '' })
    );
  }
}
