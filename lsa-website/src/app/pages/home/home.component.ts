import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { HeaderComponent } from '../../components/header/header.component';
import { AppConfigService } from '../../app-config/app-config.service';

@Component({
  selector: 'lsa-home',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  readonly homePageConfig = computed(
    () =>
      this.configService
        .appConfig()
        ?.pages?.find((page) => page.name === 'home')
  );

  readonly headerConfig = computed(() => {
    return this.homePageConfig()?.sections?.find((s) => s.name === 'header');
  });

  constructor(
    private configService: AppConfigService,
    private titleService: Title
  ) {
    effect(() => {
      if (this.homePageConfig() === undefined) {
        return; // TODO: if homePageConfig is undefined, redirect to 404 page
      } else {
        this.titleService.setTitle(this.homePageConfig()!.title);
      }
    });
  }
}
