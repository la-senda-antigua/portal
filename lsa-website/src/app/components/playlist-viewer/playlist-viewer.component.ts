import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { HydratedVideoPlaylist, VideoModel } from 'src/app/models/video.model';
import { DomSanitizer } from '@angular/platform-browser';
import { VideVerticalListComponent } from '../video-vertical-list/video-vertical-list.component';

@Component({
  selector: 'lsa-playlist-viewer',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    VideVerticalListComponent
  ],
  templateUrl: './playlist-viewer.component.html',
  styleUrl: './playlist-viewer.component.scss',
})
export class PlaylistViewerComponent implements OnInit {
  readonly data: { playlist: HydratedVideoPlaylist } = inject(MAT_DIALOG_DATA);
  readonly sanitizer = inject(DomSanitizer);
  readonly videos: VideoModel[] = [];
  readonly selectedVideo = signal<VideoModel | undefined>(undefined);
  readonly sanitizedUrl = computed(() => {
    const url = this.selectedVideo()?.videoUrl;
    if (!url) return null;

    const separator = url.includes("?") ? "&" : "?";
    const finalUrl = `${url}${separator}autoplay=0&rel=0`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl);
  });

  title = '';

  ngOnInit(): void {
    this.videos.push(...this.data.playlist.videos);
    this.videos.sort((a, b) => (a.date > b.date ? 1 : -1));
    this.title = this.data.playlist.name;
    this.selectedVideo.set(this.videos[0]);
  }

  selectVideo(video: VideoModel | HydratedVideoPlaylist) {    
    this.selectedVideo.set(video as VideoModel);
  }
}
