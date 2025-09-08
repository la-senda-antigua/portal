import { Component, input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { HydratedVideoPlaylist, VideoModel } from 'src/app/models/video.model';

@Component({
  selector: 'lsa-video-vertical-list',
  imports: [],
  templateUrl: './video-vertical-list.component.html',
  styleUrl: './video-vertical-list.component.scss'
})
export class VideVerticalListComponent implements OnInit {
  readonly videos = input.required<VideoModel[]>();
  readonly allVideosLoaded = input<boolean>(true);
  readonly moreVideosLoadedObservable = input<Observable<boolean>>();
  readonly resetLeftScroll$ = input<Observable<any>>();
  readonly selectedVideo = input<VideoModel | undefined>(undefined);
  readonly emitVideoClick = input(false);
  readonly videoTitlePrefix = input<string>('');
  
  ngOnInit(): void {
    console.log(' videos... ' , this.videos())
  }
  
}
