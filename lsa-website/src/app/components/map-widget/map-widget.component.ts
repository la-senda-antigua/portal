import { Component, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MapWidgetConfig } from '../../models/app.config.models';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'lsa-map-widget',
  imports: [MatButtonModule],
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
