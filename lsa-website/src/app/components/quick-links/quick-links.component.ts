import { Component, input, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { QuickLinksConfig } from 'src/app/models/app.config.models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'lsa-quick-links',
  imports: [MatIconModule, RouterLink],
  templateUrl: './quick-links.component.html',
  styleUrl: './quick-links.component.scss',
})
export class QuickLinksComponent {
  readonly config = input.required<QuickLinksConfig>();
  readonly data = signal<QuickLinksConfig | null>(null)
}
