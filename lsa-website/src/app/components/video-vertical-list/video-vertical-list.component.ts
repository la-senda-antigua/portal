import { Component, input, OnInit, output } from '@angular/core';
import { Observable } from 'rxjs';
import { HydratedVideoPlaylist, VideoModel } from 'src/app/models/video.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lsa-video-vertical-list',
  imports: [CommonModule],
  templateUrl: './video-vertical-list.component.html',
  styleUrl: './video-vertical-list.component.scss'
})
export class VideVerticalListComponent{
  readonly videos = input.required<VideoModel[]>();
  readonly allVideosLoaded = input<boolean>(true);
  readonly moreVideosLoadedObservable = input<Observable<boolean>>();
  readonly resetLeftScroll$ = input<Observable<any>>();
  readonly selectedVideo = input<VideoModel | undefined>(undefined);
  readonly videoTitlePrefix = input<string>('');
  
  readonly videoClick = output<HydratedVideoPlaylist | VideoModel>();
  
  
}
