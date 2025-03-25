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
    this.appConfig.set(config);
  }

  loadConfig() {
    return this.httpClient.get<any>('/assets/config.json');
  }
}
