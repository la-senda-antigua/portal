import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lsa-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent { }
