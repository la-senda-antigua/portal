import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, effect, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { ButtonConfig, NavigationOption } from '../../models/app.config.models';
import { AppConfigService } from '../../app-config/app-config.service';

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

  readonly openMobileMenu = output();
  readonly activeOption = signal<NavigationOption | null>(null);
  readonly shouldHide = signal(false);

  constructor(
    private configService: AppConfigService,
    breakpointObserver: BreakpointObserver
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

  toggleMobileMenu() {
    this.openMobileMenu.emit();
  }
}
