import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageRendererComponent } from './page-renderer.component';
import { AppConfigService } from '../../app-config/app-config.service';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { HeaderComponent } from '../header/header.component';
import { of } from 'rxjs';

describe('PageRendererComponent', () => {
  let component: PageRendererComponent;
  let fixture: ComponentFixture<PageRendererComponent>;
  let mockConfigService: jasmine.SpyObj<AppConfigService>;
  let mockActivatedRoute: jasmine.SpyObj<{}>;
  let mockTitleService: jasmine.SpyObj<Title>;

  beforeEach(async () => {
    mockConfigService = jasmine.createSpyObj('AppConfigService', ['appConfig']);
    mockActivatedRoute = {
      url: of([{ path: 'test-page' }]),
    };
    mockTitleService = jasmine.createSpyObj('Title', ['setTitle']);

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, PageRendererComponent],
      providers: [
        { provide: AppConfigService, useValue: mockConfigService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Title, useValue: mockTitleService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PageRendererComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute pageConfig based on appConfig and pageName', () => {
    mockConfigService.appConfig.and.returnValue({
      title: '',
      navigation: { index: 1, text: '', link: '' },
      pages: [
        {
          name: 'test-page',
          title: 'Test Page',
          sections: [
            { title: '', name: '' },
            { title: '', name: '' },
            { title: '', name: '' },
          ],
        },
      ],
    });

    expect(component.pageConfig()).toBeDefined();
    expect(component.pageConfig()?.sections).not.toBeNull();
  });

  it('should not include "header" in sections', () => {
    mockConfigService.appConfig.and.returnValue({
      title: '',
      navigation: { index: 1, text: '', link: '' },
      pages: [
        {
          title: '',
          name: 'test-page',
          sections: [
            { name: 'section-2', title: '' },
            { name: 'header', title: '' },
            { name: 'section-1', title: '' },
          ],
        },
      ],
    });

    const sections = component.sections()!;
    const header = sections.find((s) => s.name === 'header');
    expect(header).toBeUndefined();
    expect(sections[0].name).toBe('section-1');
    expect(sections[1].name).toBe('section-2');
  });

  it('should set the page title using Title service', () => {
    mockConfigService.appConfig.and.returnValue({
      title: '',
      navigation: { index: 1, text: '', link: '' },
      pages: [{ name: 'test-page', title: 'Test Page', sections: [] }],
    });

    fixture.detectChanges(); // Trigger effects
    expect(mockTitleService.setTitle).toHaveBeenCalledWith('Test Page');
  });

  it('should set default title if pageConfig title is undefined', () => {
    mockConfigService.appConfig.and.returnValue({
      title: '',
      navigation: { index: 1, text: '', link: '' },
      pages: [{ name: 'test-page', sections: [] } as any],
    });

    fixture.detectChanges(); // Trigger effects
    expect(mockTitleService.setTitle).toHaveBeenCalledWith('La Senda Antigua');
  });
});
