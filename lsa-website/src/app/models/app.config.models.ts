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
  descriptionBlock: DescriptionBlockConfig;
  position?: 'left' | 'right';
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

export interface NavigationOption {
  index: number;
  text: string;
  link?: string;
  options?: NavigationOption[];
}

export interface NavigationConfig {
  title?: string;
  button?: ButtonConfig;
  options?: NavigationOption[];
  index: number;
  text: string;
  link: string;
}

export interface AppConfig {
  title: string;
  pages: PageConfig[];
  navigation: NavigationConfig;
}
