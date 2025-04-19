import { CommonModule } from '@angular/common';
import { Component, effect, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { RouterLink } from '@angular/router';
import { AppConfigService } from 'src/app/app-config.service';
import { ButtonConfig, NavigationOption } from '../../models/app.config.models';

@Component({
  selector: 'lsa-mobile-menu',
  imports: [
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    CommonModule,
    MatToolbarModule,
  ],
  templateUrl: './mobile-menu.component.html',
  styleUrl: './mobile-menu.component.scss',
})
export class MobileMenuComponent {
  title = '';
  homeLink = '/';
  button?: ButtonConfig;
  options: NavigationOption[] = [];
  readonly activeOption = signal<NavigationOption | null>(null);
  readonly close = output();

  dataSource = new MatTreeNestedDataSource<any>();
  childrenAccessor = (node: any) => node.options ?? [];
  hasChild = (_: number, node: any) => {
    console.log('checking node:', node.text, node.options);
    return Array.isArray(node.options) && node.options.length > 0;
  };

  constructor(private configService: AppConfigService) {
    effect(() => {
      const config = this.configService.appConfig()?.navigation;
      this.title = config?.title ?? '';
      this.homeLink = config?.link ?? '/';
      this.button = config?.button;
      this.dataSource.data = config?.options ?? [];
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
