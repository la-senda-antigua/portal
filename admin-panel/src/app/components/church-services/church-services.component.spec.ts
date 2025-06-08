import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChurchServicesComponent } from './church-services.component';

describe('ChurchServicesComponent', () => {
  let component: ChurchServicesComponent;
  let fixture: ComponentFixture<ChurchServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChurchServicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChurchServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
