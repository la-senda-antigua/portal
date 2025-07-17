import { CommonModule } from '@angular/common';
import { Component, effect, output, signal,ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { RouterLink } from '@angular/router';
import { ButtonConfig, NavigationOption } from '../../models/app.config.models';
import {MatExpansionModule} from '@angular/material/expansion';
import { AppConfigService } from '../../app-config/app-config.service';


@Component({
  selector: 'lsa-mobile-menu',
  imports: [
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    CommonModule,
    MatToolbarModule,
    MatExpansionModule
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


  constructor(private configService: AppConfigService) {
    effect(() => {
      const config = this.configService.appConfig()?.navigation;
      this.title = config?.title ?? '';
      this.homeLink = config?.link ?? '/';
      this.button = config?.button;
      this.options = config?.options ?? [];
    });
  }

  hasChild = (node: any) =>  Array.isArray(node.options) && node.options.length > 0;


  setActiveOption(option?: NavigationOption) {
    if (!option) {
      this.activeOption.set(null);
      return;
    }

    this.activeOption.set(option);

    if(!option.options){
      this.close.emit()
    }
  }

  isSelected(option?: NavigationOption) {
    return this.activeOption() && this.activeOption()?.index === option?.index;
  }

}
