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
  textColor?: string;
  backgroundColor?: string;
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

export interface FooterConfig{
  items: FooterItemConfig[],
  copyright: string,
}

export interface FooterItemConfig{
  title: string,
  links: FooterItemLinkConfig[]
}

export interface FooterItemLinkConfig{
  text: string,
  href: string,
  icon?: string
}

export interface FloatingDescriptionConfig {
  descriptionBlock: DescriptionBlockConfig;
  position?: 'left' | 'right';
}

export interface VerseConfig{
  title: string;
  copyright: string;
  textAlign: string;
}

export interface SectionConfig {
  title: string;
  name: string;
  textAlign?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  textColor?: string;
  backgroundImage?: string;
  floatingDescription?: FloatingDescriptionConfig;
  descriptionBlock?: DescriptionBlockConfig;
  mapWidget?: MapWidgetConfig;
  imageCard?: ImageCardConfig;
  verseOfTheDay?: VerseConfig;
  footer: FooterConfig;
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
