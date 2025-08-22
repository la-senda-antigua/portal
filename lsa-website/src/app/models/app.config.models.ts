export interface ButtonConfig {
  alignment: 'left' | 'center' | 'right';
  text: string;
  link: string;
  type: 'primary' | 'secondary';
}

export interface DescriptionBlockConfig {
  lines: string[];
  button?: ButtonConfig;
  textColor?: string;
  backgroundColor?: string;
}

export interface TableColumnConfig {
  index: number;
  text: string;
}

export interface TableRowConfig {
  index: number;
  columns: TableColumnConfig[];
}

export interface TableConfig {
  index: number;
  rows: TableRowConfig[];
}

export interface MapWidgetConfig {
  src: string;
  title?: string;
  subtitle?: string;
  table?: TableConfig;
}

export interface ImageCardConfig {
  title: string;
  image: string;
  backgroundColor?: string;
  description: DescriptionBlockConfig;
}

export interface FooterConfig {
  items: FooterItemConfig[];
  copyright: string;
}

export interface FooterItemConfig {
  title: string;
  links: FooterItemLinkConfig[];
}

export interface FooterItemLinkConfig {
  text: string;
  href: string;
  icon?: string;
}

export interface FloatingDescriptionConfig {
  descriptionBlock: DescriptionBlockConfig;
  position?: 'left' | 'right';
}

export interface VerseConfig {
  title: string;
  copyright: string;
  textAlign: string;
}

export interface QuickLinksConfig {
  title?: string;
  backgrounColor?: string;
  links: IconLinkConfig[];
}

export interface IconLinkConfig {
  icon?: string;
  path?: string;
  label?: string;
}

export interface SearchBoxConfig {
  placeHolder: string;
  position?: 'left' | 'center' | 'right';
  width?: number;
  searchDelay?: number;
  iconPosition?: 'left' | 'right';
}

export interface VideoListSectionConfig{
  initialLoad?: number;
  searchBox?: SearchBoxConfig;
  descriptionBlock?: DescriptionBlockConfig;
  notFound?: string;
}

export interface RecentServicesConfig extends VideoListSectionConfig {
}

export enum VideoListType {
  Preachings = 'preachings',
  BibleStudies = 'biblestudies',
  GalleryVideos = 'galleryvideos',
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
  searchBox?: SearchBoxConfig;
  mapWidget?: MapWidgetConfig;
  imageCard?: ImageCardConfig;
  verseOfTheDay?: VerseConfig;
  quickLinks?: QuickLinksConfig;
  recentServices?: RecentServicesConfig;
  calendarListView?: CalendarListViewConfig;
  footer?: FooterConfig;
}

export interface PageConfig {
  name: string;
  title: string;
  navigation?: {
    textColor: 'light' | 'dark';
    backgroundColor: 'system' | 'none';
    useShadow: boolean;
  };
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

export interface LiveBroadcastConfig {
  title: string;
  button?: ButtonConfig;
  notification?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface CalendarListViewConfig{
  title: string;
  description: DescriptionBlockConfig;
}

export interface AppConfig {
  title: string;
  pages: PageConfig[];
  navigation: NavigationConfig;
  live: LiveBroadcastConfig;
}
