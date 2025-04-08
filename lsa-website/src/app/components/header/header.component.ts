import { Component, computed, input } from '@angular/core';
import { SectionConfig } from 'src/app/models/app.config.models';

@Component({
  selector: 'lsa-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly headerConfig = input.required<SectionConfig>();
  readonly title = computed(() => this.headerConfig().title);
  readonly backgroundColor = computed(
    () => this.headerConfig().backgroundColor ?? undefined
  );
  readonly backgroundImage = computed(
    () => this.headerConfig().backgroundImage ?? undefined
  );
  readonly floatingDescription = computed(
    () => this.headerConfig().floatingDescription ?? undefined
  );
  readonly overlayColor = computed(()=>{
    if(!this.backgroundImage() || !this.backgroundColor()){
      return undefined;
    }
    return `background-image: radial-gradient(rgba(56,56,56,0.4), ${this.backgroundColor()})`
  })
}
