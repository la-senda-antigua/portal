import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { AppConfigService } from './app-config.service';

const mockConfig = {
  title: 'this is a mock',
  pages: [
    {
      name: 'home', title: 'home page',
      sections: [
        {
          title: 'section1', name: 'name section1',
        }
      ]
    }, {}],
  themes: {},
  selectedTheme: 1,
};

fdescribe('AppConfigService', () => {
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

  it('should parse section correctly', () => {
    const section = mockConfig.pages[0].sections![0]
    const parsedPage = (service as any).parseConfigSection(section);
    expect(parsedPage.title).toBe('section1');
    expect(parsedPage.name).toBe('name section1');
  });

  it('should parse page correctly', () => {
    const page = mockConfig.pages[0]
    const parsedPage = (service as any).parseConfigPage(page);
    expect(parsedPage.title).toBe('home page');
    expect(parsedPage.name).toBe('home');
    expect(parsedPage.sections.length).toBe(1);
  });



  it('should handle missing optional fields in parseFloatingDescription', () => {
      const parsedFloatingDescription = (service as any).parseFloatingDescription(null);
      expect(parsedFloatingDescription).toEqual({});
  });

  // it('should handle missing optional fields in parseDescriptionBlock', () => {
  //     const parsedDescriptionBlock = (service as any).parseDescriptionBlock(null);
  //     expect(parsedDescriptionBlock).toEqual({});
  // });

  // it('should handle missing optional fields in parseMapWidget', () => {
  //     const parsedMapWidget = (service as any).parseMapWidget(null);
  //     expect(parsedMapWidget).toEqual({});
  // });

  // it('should handle missing optional fields in parseImageCard', () => {
  //     const parsedImageCard = (service as any).parseImageCard(null);
  //     expect(parsedImageCard).toEqual({});
  // });
});
