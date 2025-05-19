import { Component, input } from '@angular/core';
import { FooterConfig } from 'src/app/models/app.config.models';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'lsa-footer',
  imports: [MatIconModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  readonly config = input.required<FooterConfig>();  
}
