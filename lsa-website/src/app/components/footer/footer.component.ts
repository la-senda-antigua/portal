import { Component, input } from '@angular/core';
import { FooterConfig } from 'src/app/models/app.config.models';

@Component({
  selector: 'lsa-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
    readonly config = input.required<FooterConfig>();
  
}
