import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AppConfigService } from './app-config.service';

const mockConfig = {
  title: 'este es el título principal',
  pages: [
    {
      name: 'home',
      title: 'este es el título de la página de inicio',
      sections: [
        {
          name: 'header',
          title: 'este es el título del encabezado',
          'floating-description': {
            position: 'left',
            'description-block': {
              lines: [
                'este es el contenido de line-1',
                'este es el contenido de line-2',
              ],
            },
          },
          'background-image': 'assets/images/ejemplo-header.jpg',
        },
        {
          name: 'section-1',
          title: 'este es el título de la sección 1',
          'description-block': {
            lines: [
              'este es el contenido de la sección 1, línea 1',
              'este es el contenido de la sección 1, línea 2',
            ],
          },
          'background-color': '#e0e0e0',
        },
        {
          name: 'section-2',
          'background-color': 'rgb(200, 200, 200)',
        },
      ],
    },
  ],
  navigation: {
    title: 'este es el título de navegación',
    link: '/home',
    options: [
      {
        index: 1,
        text: 'este es el texto de la opción 1',
        options: [
          {
            index: 1,
            text: 'este es el texto de la subopción 1',
            link: '/suboption1',
          },
          {
            index: 2,
            text: 'este es el texto de la subopción 2',
            link: '/suboption2',
          },
        ],
      },
      {
        index: 2,
        text: 'este es el texto de la opción 2',
        options: [
          {
            index: 1,
            text: 'este es el texto de la subopción 1',
            link: '/suboption3',
          },
        ],
      },
      {
        index: 3,
        text: 'este es el texto de la opción 3',
        link: '/contact',
      },
    ],
    button: {
      text: 'este es el texto del botón',
      link: '/support',
    },
  },
  live: {
    title: '',
  },
};

describe('AppConfigService', () => {
  let service: AppConfigService;
  let httpClient: HttpClient;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpClient,
          useValue: {
            get: () => of(null),
          },
        },
        AppConfigService,
      ],
    });
    service = TestBed.inject(AppConfigService);
    httpClient = TestBed.inject(HttpClient);
    service.initializeConfig(mockConfig);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load configuration from the server', (done) => {
    spyOn(httpClient, 'get').and.returnValue(of(null));

    service.loadConfig().subscribe(() => {
      expect(httpClient.get).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('should parse title correctly', () => {
    const parsedSite = service.appConfig();
    expect(parsedSite?.title).toBe('este es el título principal');
  });

  it('should parse pages correctly', () => {
    const parsedSite = service.appConfig();
    expect(parsedSite?.pages).toBeDefined();
    expect(parsedSite?.pages.length).toBe(1);
    expect(parsedSite?.pages[0].name).toBe('home');
    expect(parsedSite?.pages[0].title).toBe(
      'este es el título de la página de inicio'
    );
  });

  it('should parse sections correctly', () => {
    const parsedSite = service.appConfig();
    const sections = parsedSite?.pages[0].sections;

    expect(sections).toBeDefined();
    expect(sections?.length).toBe(3);
    expect(sections?.[0].title).toBe('este es el título del encabezado');
    expect(sections?.[1].title).toBe('este es el título de la sección 1');
    expect(sections?.[1].backgroundColor).toBe('#e0e0e0');
  });

  it('should parse floating description correctly', () => {
    const parsedSite = service.appConfig();
    const floatingDescription =
      parsedSite?.pages[0].sections[0].floatingDescription;

    expect(floatingDescription).toBeDefined();
    expect(floatingDescription?.position).toBe('left');
    expect(floatingDescription?.descriptionBlock.lines[0]).toBe(
      'este es el contenido de line-1'
    );
  });

  it('should parse navigation correctly', () => {
    const parsedSite = service.appConfig();
    const navigation = parsedSite?.navigation;

    expect(navigation).toBeDefined();
    expect(navigation?.title).toBe('este es el título de navegación');
    expect(navigation?.link).toBe('/home');

    const options = navigation?.options;
    expect(options).toBeDefined();
    expect(options?.length).toBe(3);
    expect(options?.[0].text).toBe('este es el texto de la opción 1');
    expect(options?.[1].text).toBe('este es el texto de la opción 2');
    expect(options?.[2].text).toBe('este es el texto de la opción 3');
  });
});
