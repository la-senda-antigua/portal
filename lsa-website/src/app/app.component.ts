import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'La Senda Antigua';

  constructor(httpClient: HttpClient, titleService: Title) {}
}
