import { Component, effect, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AppConfigService } from '../app-config.service';
import { ButtonConfig, NavigationOption } from '../models/app.config.models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'lsa-nav-bar',
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    RouterLink,
  ],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
})
export class NavBarComponent {
  title = '';
  link = '/';
  button?: ButtonConfig;
  options: NavigationOption[] = [];

  constructor(private configService: AppConfigService) {
    effect(() => {
      const config = this.configService.appConfig()?.navigation;
      this.title = config?.title ?? '';
      this.link = config?.link ?? '/';
      this.button = config?.button;
      this.options = config?.options ?? [];
    });
  }
}
