import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { AppConfigService } from '../../app-config.service';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'lsa-page-renderer',
  imports: [HeaderComponent],
  templateUrl: './page-renderer.component.html',
  styleUrl: './page-renderer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageRendererComponent {
  readonly pageConfig = computed(() =>
    this.configService
      .appConfig()
      ?.pages?.find((page) => page.name === this.pageName())
  );
  readonly sections = computed(()=> this.pageConfig()?.sections.sort((a, b) => {
    if(a.name === 'header') return -1;
    if(b.name === 'header') return 1;
    const aIndex = a.name.replace('section-', '');
    const bIndex = b.name.replace('section-', '');
    return parseInt(aIndex) - parseInt(bIndex);
    }));
  readonly pageName = toSignal(
    this.activeRoute.url.pipe(map((url) => url[0].path))
  );

  constructor(
    private configService: AppConfigService,
    private activeRoute: ActivatedRoute,
    titleService: Title
  ) {
    effect(() =>
      titleService.setTitle(this.pageConfig()?.title ?? 'La Senda Antigua')
    );
  }
}
