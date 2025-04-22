import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { DescriptionBlockConfig } from 'src/app/models/app.config.models';

@Component({
  selector: 'lsa-description-block',
  imports: [],
  templateUrl: './description-block.component.html',
  styleUrl: './description-block.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DescriptionBlockComponent {  
  readonly descriptionBlockConfig = input.required<DescriptionBlockConfig>();
}
