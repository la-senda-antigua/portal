import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { signal } from '@angular/core';
import {
  AppConfig,
  PageConfig,
  SectionConfig,
  FloatingDescriptionConfig,
  DescriptionBlockConfig,
  MapWidgetConfig,  
  ImageCardConfig,
  NavigationConfig,
  VerseConfig,
} from '../models/app.config.models';

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  readonly appConfig = signal<AppConfig | undefined>(undefined);

  constructor(private httpClient: HttpClient) {}

  initializeConfig(config: any) {
    const _appConfig = this.parseConfig(config);
    this.appConfig.set(_appConfig);
  }

  loadConfig() {
    return this.httpClient.get<unknown>('/assets/app.config.json');
  }

  private parseConfig(config: any): AppConfig {
    return {
      title: config.title,
      pages: config.pages.map(this.parseConfigPage.bind(this)),
      navigation: this.parseNavigation(config.navigation),
    };
  }

  private parseConfigPage(page: any): PageConfig {
    return {
      name: page.name,
      title: page.title,
      sections: page.sections.map(this.parseConfigSection.bind(this)),
    };
  }

  private parseConfigSection(section: any): SectionConfig {
    return {
      title: section.title,
      name: section.name,
      textAlign: section['text-align'],
      textColor: section['text-color'],
      backgroundColor: section['background-color'],
      backgroundImage: section['background-image'],
      floatingDescription: this.parseFloatingDescription(
        section['floating-description']
      ),
      descriptionBlock: this.parseDescriptionBlock(
        section['description-block']
      ),
      mapWidget: this.parseMapWidget(section['map-widget']),
      imageCard: this.parseImageCard(section['image-card']),
      verseOfTheDay: this.parseVerseOfTheDay(section['verse-of-the-day']),
    };
  }

  private parseFloatingDescription(
    floatingDescription: any
  ): FloatingDescriptionConfig {
    if (!floatingDescription) {
      return {} as FloatingDescriptionConfig;
    }
    return {
      descriptionBlock: this.parseDescriptionBlock(
        floatingDescription['description-block']
      ),
      position: floatingDescription.position,
    };
  }

  private parseDescriptionBlock(descriptionBlock: any): DescriptionBlockConfig {
    if (!descriptionBlock) {
      return {} as DescriptionBlockConfig;
    }
    return {
      line1: descriptionBlock['line-1'],
      line2: descriptionBlock['line-2'],
      line3: descriptionBlock['line-3'],
      line4: descriptionBlock['line-4'],
      line5: descriptionBlock['line-5'],
      button: descriptionBlock.button,
      textColor: descriptionBlock['text-color'],
      backgroundColor: descriptionBlock['background-color'],
    };
  }

  private parseMapWidget(mapWidget: any): MapWidgetConfig {
    if (!mapWidget) {
      return {} as MapWidgetConfig;
    }
    return {
      src: mapWidget.src,
      title: mapWidget.title,
      subtitle: mapWidget.subtitle,
      table: mapWidget.table
    };
  }

  private parseImageCard(imageCard: any): ImageCardConfig {
    if (!imageCard) {
      return {} as ImageCardConfig;
    }
    return {
      title: imageCard.title,
      image: imageCard.image,
      description: this.parseDescriptionBlock(imageCard.description),
    };
  }

  private parseNavigation(navigation: any): NavigationConfig {
    const config: NavigationConfig = {
      ...navigation,
      options: navigation.options?.map(this.parseNavigation.bind(this)),
    };
    return config;
  }

  private parseVerseOfTheDay(verseOfTheDay: any) : VerseConfig {
    if (!verseOfTheDay) return {} as VerseConfig;

    return {
      title: verseOfTheDay.title,
      copyright: verseOfTheDay.copyright,
      textAlign: verseOfTheDay['text-align']
    }
  }

}
