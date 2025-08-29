import { Component, computed, inject, OnInit } from '@angular/core';
import { VideosService } from 'src/app/services/videos.service';
import { VideoCollageComponent } from '../video-collage/video-collage.component';
import { VideoCardComponent } from '../video-card/video-card.component';
import { HydratedVideoPlaylist, VideoModel } from 'src/app/models/video.model';

interface GalleryVideoOrPlaylist {
  id: number | number;
  date: Date;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  preacher: string;
  playlist: string;
  name: string;
  videos: ReadonlyArray<VideoModel>;
  maestros: string[]
}

@Component({
  selector: 'lsa-video-gallery',
  imports: [VideoCollageComponent, VideoCardComponent],
  templateUrl: './video-gallery.component.html',
  styleUrl: './video-gallery.component.scss',
})
export class VideoGalleryComponent implements OnInit {
  readonly videoService = inject(VideosService);
  readonly galleries = computed(() => [...this.videoService.galleryVideos()] as GalleryVideoOrPlaylist[]);

  ngOnInit(): void {
    if (this.galleries()?.length === 0) {
      this.videoService.loadAllGalleryVideos();
      this.videoService.loadGalleryVideosPlaylists();
    }
  }
}
