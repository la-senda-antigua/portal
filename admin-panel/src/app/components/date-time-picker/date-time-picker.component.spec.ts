import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateTimePickerComponent } from './date-time-picker.component';

describe('DateTimePickerComponent', () => {
  let component: DateTimePickerComponent;
  let fixture: ComponentFixture<DateTimePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateTimePickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DateTimePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with input values', () => {
    component.initialStartDate = '2025-12-10T10:00:00';
    component.initialEndDate = '2025-12-10T18:00:00';
    component.initialisAllDay = true;

    component.ngOnInit();

    expect(component.startTimeString).toBe('2025-12-10T10:00:00');
    expect(component.endTimeString).toBe('2025-12-10T18:00:00');
    expect(component.allDay).toBe(true);
  });

  it('should validate date range', () => {
    component.initialStartDate = '2025-12-10T18:00:00';
    component.initialEndDate = '2025-12-10T10:00:00';

    component.ngOnInit();

    expect(component.dateTimeForm.invalid).toBeTruthy();
    expect(
      component.dateTimeForm.errors?.['invalidDateTimeRange']
    ).toBeTruthy();
  });

  it('should emit events when date changes', () => {
    spyOn(component.startDateChange, 'emit');
    spyOn(component.isValid, 'emit');

    const testDate = new Date('2025-12-11T10:00:00');
    component.onStartDateChange(testDate);

    expect(component.startDateChange.emit).toHaveBeenCalledWith(
      '2025-12-11T10:00:00'
    );
    expect(component.isValid.emit).toHaveBeenCalled();
  });

  it('should handle all day toggle correctly', () => {
    spyOn(component.allDayChange, 'emit');
    component.allDay = true;

    component.onAllDayChange();

    expect(component.startTimeString).toContain('T00:00:00');
    expect(component.endTimeString).toContain('T23:59:59');
    expect(component.allDayChange.emit).toHaveBeenCalledWith(true);
  });
});
