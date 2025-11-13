import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { LsaServiceHubService } from 'src/app/services/lsa-service-hub.service';
import { AppConfigService } from '../../app-config/app-config.service';
import { HeaderComponent } from '../header/header.component';
import { LiveServiceDialogComponent } from '../live-service-dialog/live-service-dialog.component';
import { RadioService } from '../radio-dialog/radio.service';
import { SectionRendererComponent } from '../section-renderer/section-renderer.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'lsa-page-renderer',
  imports: [HeaderComponent, SectionRendererComponent, FooterComponent],
  templateUrl: './page-renderer.component.html',
  styleUrl: './page-renderer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageRendererComponent {
  readonly pageConfig = this.configService.currentPageConfig;
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
  readonly pageFooterOptions = computed(() => this.pageConfig()?.footer);
  readonly footerConfig = computed(() => this.configService.appConfig()?.footer);

  readonly pageName = input<string>();
  readonly matDialog = inject(MatDialog);
  readonly router = inject(Router);
  private liveServiceDialog?: MatDialogRef<LiveServiceDialogComponent>;
  private snackBar = inject(MatSnackBar);
  private radioService = inject(RadioService);

  constructor(
    private configService: AppConfigService,
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
      if (this.pageName() != undefined) {
        if (this.pageName() === 'radio') {
          this.radioService.popUpRadio();
          if (this.configService.currentPageName() == undefined) {
            this.configService.setCurrentPageName('home');
          }
          this.router.navigate([`/${this.configService.currentPageName()}`]);
          return;
        }
        this.configService.setCurrentPageName(this.pageName()!);
      }
    });

    effect(() => {
      if (
        this.pageConfig() == undefined ||
        this.pageConfig()!.isNullOrEmpty()
      ) {
        this.configService.setCurrentPageName('inprogress');
      }
    });

    effect(() => {
      const _ = this.pageConfig();

      document
        .getElementById('page-content')
        ?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
