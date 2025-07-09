import { Component, computed, inject } from '@angular/core';
import { AppConfigService } from './app-config/app-config.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
})
export class AppComponent {
  readonly appConfigService = inject(AppConfigService);
  readonly pageNavigationSettings = computed(
    () => this.appConfigService.currentPageConfig()?.navigation
  );
}
