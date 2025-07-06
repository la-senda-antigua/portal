import { HttpClient } from '@angular/common/http';
import { computed, Injectable } from '@angular/core';
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
  FooterConfig,
  QuickLinksConfig,
  LiveBroadcastConfig,
} from '../models/app.config.models';

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  private _currentPageName = signal<string | undefined>(undefined);
  get currentPageName() {
    return this._currentPageName;
  }

  get currentPageConfig() {
    return computed(() =>
      this.appConfig()?.pages.find(
        (page) => page.name === this.currentPageName()
      )
    );
  }

  readonly appConfig = signal<AppConfig | undefined>(undefined);

  constructor(private httpClient: HttpClient) {}

  initializeConfig(config: any) {
    const _appConfig = this.parseConfig(config);
    this.appConfig.set(_appConfig);
  }

  loadConfig() {
    return this.httpClient.get<unknown>('/assets/app.config.json');
  }

  setCurrentPageName(pageName: string) {
    this._currentPageName.set(pageName);
  }

  private parseConfig(config: any): AppConfig {
    return {
      title: config.title,
      pages: config.pages.map(this.parseConfigPage.bind(this)),
      navigation: this.parseNavigation(config.navigation),
      live: this.parseLiveConfig(config.live),
    };
  }

  private parseLiveConfig(config: any): LiveBroadcastConfig {
    return {
      title: config.title,
      notification: config.notification,
      button: config.button,
      backgroundColor: config['background-color'],
      textColor: config['text-color'],
    };
  }
  private parseConfigPage(page: any): PageConfig {
    return {
      name: page.name,
      title: page.title,
      navigation: {
        textColor: page.navigation?.['text-color'] ?? 'light',
        useShadow: page.navigation?.['use-shadow'] ?? true,
        backgroundColor: page.navigation?.['background-color'] ?? 'none'
      },
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
      quickLinks: this.parseQuickLinks(section['quick-links']),
      footer: this.parseFooter(section['footer']),
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
      lines: descriptionBlock.lines || [],
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
      table: mapWidget.table,
    };
  }

  private parseImageCard(imageCard: any): ImageCardConfig {
    if (!imageCard) {
      return {} as ImageCardConfig;
    }
    return {
      title: imageCard.title,
      image: imageCard.image,
      backgroundColor: imageCard['background-color'],
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

  private parseVerseOfTheDay(verseOfTheDay: any): VerseConfig {
    if (!verseOfTheDay) return {} as VerseConfig;

    return {
      title: verseOfTheDay.title,
      copyright: verseOfTheDay.copyright,
      textAlign: verseOfTheDay['text-align'],
    };
  }

  private parseFooter(footer: any): FooterConfig {
    if (!footer) return {} as FooterConfig;

    if (footer.copyright) {
      const currentYear = new Date().getFullYear();
      let copyright: string = footer.copyright;
      copyright = copyright.replace('[year]', currentYear.toString());
      footer.copyright = '© ' + copyright;
    }

    return footer;
  }

  private parseQuickLinks(quickLinks: any): QuickLinksConfig {
    if (!quickLinks) return {} as QuickLinksConfig;

    return {
      title: quickLinks['title'],
      backgrounColor: quickLinks['background-color'],
      links: quickLinks['links'],
    };
  }
}
