import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { LsaServiceHubService } from 'src/app/lsa-service-hub/lsa-service-hub.service';
import { AppConfigService } from '../../app-config/app-config.service';
import { HeaderComponent } from '../header/header.component';
import { LiveServiceDialogComponent } from '../live-service-dialog/live-service-dialog.component';
import { SectionRendererComponent } from '../section-renderer/section-renderer.component';

@Component({
  selector: 'lsa-page-renderer',
  imports: [HeaderComponent, SectionRendererComponent],
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
  readonly sections = computed(() =>
    this.pageConfig()
      ?.sections.filter((s) => s.name!! && s.name !== 'header')
      .sort((a, b) => {
        const aIndex = a.name.replace('section-', '');
        const bIndex = b.name.replace('section-', '');
        return parseInt(aIndex) - parseInt(bIndex);
      })
  );
  readonly headerConfig = computed(() =>
    this.pageConfig()?.sections.find((section) => section.name === 'header')
  );
  readonly pageName = toSignal(
    this.activeRoute.url.pipe(map((url) => url[0].path))
  );
  readonly matDialog = inject(MatDialog);
  private liveServiceDialog?: MatDialogRef<LiveServiceDialogComponent>;
  private snackBar = inject(MatSnackBar);

  constructor(
    private configService: AppConfigService,
    private activeRoute: ActivatedRoute,
    liveService: LsaServiceHubService,
    titleService: Title
  ) {
    effect(() =>
      titleService.setTitle(this.pageConfig()?.title ?? 'La Senda Antigua')
    );
    effect(() => {
      const { isServiceOn, videoUrl } = liveService.liveServiceState();
      if (isServiceOn) {
        if (this.liveServiceDialog !== undefined) {
          this.liveServiceDialog.close();
        }
        this.liveServiceDialog = this.matDialog.open(
          LiveServiceDialogComponent,
          {
            data: { videoUrl },
            disableClose: true,
            hasBackdrop: true,
          }
        );
      } else {
        this.liveServiceDialog?.close();
        this.snackBar._openedSnackBarRef?.dismiss();
      }
    });

    effect(() => {
      if(this.pageName() != undefined) {
        this.configService.setCurrentPageName(this.pageName()!);
      }
    });
  }
}
