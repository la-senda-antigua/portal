import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

export interface ButtonConfig {
  alignment: 'left' | 'center' | 'right';
  text: string;
  link: string;
  type: 'primary' | 'secondary';
}

export interface DescriptionBlockConfig {
  line1: string;
  line2?: string;
  line3?: string;
  line4?: string;
  line5?: string;
  button?: ButtonConfig;
}

export interface MapWidgetTableConfig {
  cell11: string;
  cell12: string;
  cell21: string;
  cell22: string;
  cell31: string;
  cell32: string;
}

export interface MapWidgetConfig {
  src: string;
  title?: string;
  subtitle?: string;
  table?: MapWidgetTableConfig;
}

export interface ImageCardConfig {
  title: string;
  image: string;
  description: DescriptionBlockConfig;
}

export interface FloatingDescriptionConfig {
  textLine1: string;
  textLine2?: string;
  button: ButtonConfig;
  position: 'left' | 'right';
}

export interface SectionConfig {
  title: string;
  name: string;
  backgroundColor?: string;
  backgroundImage?: string;
  floatingDescription?: FloatingDescriptionConfig;
  descriptionBlock?: DescriptionBlockConfig;
  mapWidget?: MapWidgetConfig;
  imageCard?: ImageCardConfig;
}

export interface PageConfig {
  name: string;
  title: string;
  sections: SectionConfig[];
}

export interface AppConfig {
  title: string;
  pages: PageConfig[];
}

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  readonly appConfig = signal<AppConfig | undefined>(undefined);

  constructor(private httpClient: HttpClient) {}

  initializeConfig(config: any) {
    const _appConfig: AppConfig = {
      title: config.title,
      pages: []
    }
    for (const pageIndex in config.pages) {
      if (Object.prototype.hasOwnProperty.call(config.pages, pageIndex)) {
        const page = config.pages[pageIndex];
        const _page: PageConfig = {
          name: page.name,
          title: page.title,
          sections: []
        }
        for (const sectionIndex in page.sections) {
          if (Object.prototype.hasOwnProperty.call(page.sections, sectionIndex)) {
            const section = page.sections[sectionIndex];
            const _section: SectionConfig = {
              title: section.title,
              name: section.name,
              backgroundColor: section.backgroundColor,
              backgroundImage: section.backgroundImage,
              floatingDescription: section.floatingDescription,
              descriptionBlock: section.descriptionBlock,
              mapWidget: section.mapWidget,
              imageCard: section.imageCard
            }
            _page.sections.push(_section);
          }
        }
        _appConfig.pages.push(_page);
      }
    }
    this.appConfig.set(_appConfig);
    console.log(this.appConfig())
  }

  loadConfig() {
    return this.httpClient.get<unknown>('/assets/app.config.json');
  }
}
