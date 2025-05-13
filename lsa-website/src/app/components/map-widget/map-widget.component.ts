import { Component, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MapWidgetConfig } from 'src/app/models/app.config.models';

@Component({
  selector: 'lsa-map-widget',
  imports: [],
  templateUrl: './map-widget.component.html',
  styleUrl: './map-widget.component.scss'
})
export class MapWidgetComponent {
  readonly config = input.required<MapWidgetConfig>();
  safeUrl: SafeResourceUrl | undefined;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.config().src);

  }
}
