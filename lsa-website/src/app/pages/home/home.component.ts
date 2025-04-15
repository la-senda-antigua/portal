import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AppConfigService } from 'src/app/app-config.service';
import { HeaderComponent } from '../../components/header/header.component';
import { PageConfig } from 'src/app/models/app.config.models';


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
