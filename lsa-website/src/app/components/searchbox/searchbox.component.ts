import { Component, computed, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { SearchBoxConfig } from 'src/app/models/app.config.models';

@Component({
  selector: 'lsa-searchbox',
  imports: [MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './searchbox.component.html',
  styleUrl: './searchbox.component.scss',
})
export class SearchboxComponent {
  readonly config = input.required<SearchBoxConfig>();
  readonly searchQueryChange = output<string>();

  readonly label = computed(() => this.config().placeHolder ?? '');
  readonly position = computed(() => this.config().position ?? 'center');
  readonly width = computed(() => (this.config().width ?? 300) + 'px');
  readonly searchDelay = computed(() => this.config().searchDelay ?? 500);
  readonly iconPosition = computed(() => this.config().iconPosition ?? 'left');
  readonly positionStyle = computed(() => {
    if (this.position() === 'left') {
      return 'margin-right: auto;';
    }
    if (this.position() === 'right') {
      return 'margin-left: auto;';
    }
    return 'margin: auto;';
  });
  readonly delay = computed(() => this.config().searchDelay ?? 100);
  private _timer?: any;

  emitSearchQueryChange(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    if (this._timer != undefined) {
      clearTimeout(this._timer);
      this._timer = undefined;
    }
    this._timer = setTimeout(() => {
      this.searchQueryChange.emit(query);
    }, this.delay());
  }
}
