import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { DescriptionBlockConfig, SectionConfig } from 'src/app/models/app.config.models';
import { CommonModule } from '@angular/common';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, HeaderComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(HeaderComponent);
  });

  it('should compute title correctly', () => {
    const mockConfig = { title: 'Test Title' } as SectionConfig;
    fixture.componentRef.setInput('headerConfig', mockConfig);
    component = fixture.componentInstance;
    expect(component.title()).toBe('Test Title');
  });

  it('should compute backgroundColor correctly', () => {
    const mockConfig = { backgroundColor: '#FFFFFF' } as SectionConfig;
    fixture.componentRef.setInput('headerConfig', mockConfig);
    component = fixture.componentInstance;
    expect(component.backgroundColor()).toBe('#FFFFFF');
  });

  it('should compute backgroundImage correctly', () => {
    const mockConfig = { backgroundImage: 'image.jpg' } as SectionConfig;
    fixture.componentRef.setInput('headerConfig', mockConfig);
    component = fixture.componentInstance;
    expect(component.backgroundImage()).toBe('image.jpg');
  });

  it('should compute description correctly', () => {
    const mockConfig = {
      floatingDescription: {
        descriptionBlock: {
          lines:[
            'Line 1',
            'Line 2',
        ]
        },
      },
    };
    fixture.componentRef.setInput('headerConfig', mockConfig);
    component = fixture.componentInstance;
    expect(component.description()).toEqual(['Line 1', 'Line 2']);
  });

  it('should compute textColor correctly', () => {
    const mockConfig = {
      floatingDescription: {
        descriptionBlock: {
          textColor: '#000000',
        } as DescriptionBlockConfig,
      },
    };
    fixture.componentRef.setInput('headerConfig', mockConfig);
    component = fixture.componentInstance;
    expect(component.textColor()).toBe('#000000');
  });

  it('should compute textPosition correctly', () => {
    const mockConfig = {
      floatingDescription: {
        position: 'right',
      },
    };
    fixture.componentRef.setInput('headerConfig', mockConfig);
    component = fixture.componentInstance;
    expect(component.textPosition()).toBe('right: 0; text-align: right');
  });

  it('should compute overlayColor correctly', () => {
    const mockConfig = {
      backgroundColor: '#FFFFFF',
      backgroundImage: 'image.jpg',
    };
    fixture.componentRef.setInput('headerConfig', mockConfig);
    component = fixture.componentInstance;
    expect(component.overlayColor()).toBe(
      'background-image: radial-gradient(rgba(56,56,56,0.4), #FFFFFF)'
    );
  });
});
