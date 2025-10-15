export interface ButtonConfig {
  alignment: 'left' | 'center' | 'right';
  text: string;
  link: string;
  type: 'primary' | 'secondary';
  target?: '_blank' | '_self' | '_parent' | '_top' | null;
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
  button?: ButtonConfig;
}

export interface ImageCardConfig {
  title: string;
  image: string;
  backgroundColor?: string;
  description: DescriptionBlockConfig;
  imagePosition?: 'left' | 'right';
  backgroundSize?: string;
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
  position?: 'left' | 'right' | 'center';
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

export interface VideoListSectionConfig {
  searchBox?: SearchBoxConfig;
  descriptionBlock?: DescriptionBlockConfig;
  notFound?: string;
  initialLoad?: number;
}

export interface RecentServicesConfig extends VideoListSectionConfig {}

export interface PreachingPlaylistsConfig {
  descriptionBlock?: DescriptionBlockConfig;
}

export interface BibleCoursesConfig extends VideoListSectionConfig {}

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
  backgroundPosition?: string;
  floatingDescription?: FloatingDescriptionConfig;
  descriptionBlock?: DescriptionBlockConfig;
  searchBox?: SearchBoxConfig;
  mapWidget?: MapWidgetConfig;
  imageCard?: ImageCardConfig;
  verseOfTheDay?: VerseConfig;
  quickLinks?: QuickLinksConfig;
  recentServices?: RecentServicesConfig;
  preachingPlaylists?: PreachingPlaylistsConfig;
  bibleCourses?: BibleCoursesConfig;
  videoGallery?: VideoGalleryConfig;
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

export interface VideoGalleryConfig {
  descriptionBlock?: DescriptionBlockConfig;
  show: boolean;
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

export interface CalendarListViewConfig {
  title: string;
  description: DescriptionBlockConfig;
}

export interface AppConfig {
  title: string;
  pages: PageConfig[];
  navigation: NavigationConfig;
  live: LiveBroadcastConfig;
}
