import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AppConfigService } from '../app-config.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ButtonConfig, NavigationOption } from '../models/app.config.models';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs';

@Component({
  selector: 'lsa-nav-bar',
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    RouterLink,
    CommonModule,
  ],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
})
export class NavBarComponent {
  title = '';
  homeLink = '/';
  button?: ButtonConfig;
  options: NavigationOption[] = [];

  readonly activeOption = signal<NavigationOption | null>(null);
  readonly shouldHide = signal(false);

  constructor(
    private configService: AppConfigService,
    private breakpointObserver: BreakpointObserver
  ) {
    breakpointObserver.observe('(max-width: 850px)').subscribe((state) => {
      this.shouldHide.set(state.matches);
    });
    effect(() => {
      const config = this.configService.appConfig()?.navigation;
      this.title = config?.title ?? '';
      this.homeLink = config?.link ?? '/';
      this.button = config?.button;
      this.options = config?.options ?? [];
    });
  }

  setActiveOption(option?: NavigationOption) {
    if (!option) {
      this.activeOption.set(null);
      return;
    }
    this.activeOption.set(option);
  }
}
