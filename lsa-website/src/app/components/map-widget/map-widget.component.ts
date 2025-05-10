import { Component, input } from '@angular/core';
import { MapWidgetConfig } from 'src/app/models/app.config.models';

@Component({
  selector: 'lsa-map-widget',
  imports: [],
  templateUrl: './map-widget.component.html',
  styleUrl: './map-widget.component.scss'
})
export class MapWidgetComponent {
  readonly config = input.required<MapWidgetConfig>();

  ngOnInit() {
    console.log('map widget init', this.config);
  }
}
