import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { AppConfigService } from './app-config.service';

const mockConfig = {
  title: 'this is a mock',
  pages: [{ name: 'home', title: 'home page', sections: [] }, {}],
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

  // it('should parse configuration page correctly', () => {
  //     const mockPage = {
  //         name: 'about',
  //         title: 'About Us',
  //         sections: [],
  //     };

  //     const parsedPage = (service as any).parseConfigPage(mockPage);
  //     expect(parsedPage.name).toBe('about');
  //     expect(parsedPage.title).toBe('About Us');
  //     expect(parsedPage.sections).toEqual([]);
  // });

  // it('should parse configuration section correctly', () => {
  //     const mockSection = {
  //         title: 'Section 1',
  //         name: 'section1',
  //         'background-color': '#fff',
  //         'background-image': 'image.jpg',
  //         'floating-description': null,
  //         'description-block': null,
  //         'map-widget': null,
  //         'image-card': null,
  //     };

  //     const parsedSection = (service as any).parseConfigSection(mockSection);
  //     expect(parsedSection.title).toBe('Section 1');
  //     expect(parsedSection.name).toBe('section1');
  //     expect(parsedSection.backgroundColor).toBe('#fff');
  //     expect(parsedSection.backgroundImage).toBe('image.jpg');
  // });

  // it('should handle missing optional fields in parseFloatingDescription', () => {
  //     const parsedFloatingDescription = (service as any).parseFloatingDescription(null);
  //     expect(parsedFloatingDescription).toEqual({});
  // });

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
