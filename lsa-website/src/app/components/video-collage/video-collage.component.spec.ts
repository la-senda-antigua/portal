import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoCollageComponent } from './video-collage.component';

describe('VideoCollageComponent', () => {
  let component: VideoCollageComponent;
  let fixture: ComponentFixture<VideoCollageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoCollageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoCollageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
