import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EditPublicEventFormComponent, PublicEventFormData } from './edit-public-event-form.component';
import { PreachersService } from '../../services/preachers.service';
import { TableViewAccessMode, TableViewType } from '../table-view/table-view.component';

describe('EditPublicEventFormComponent', () => {
    let fixture: ComponentFixture<EditPublicEventFormComponent>;
    let component: EditPublicEventFormComponent;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<EditPublicEventFormComponent>>;
    let datePipe: DatePipe;

    const baseData: PublicEventFormData = {
        mode: TableViewAccessMode.edit,
        type: TableViewType.publicEvent,
        data: {
            id: 1,
            title: 'Initial Title',
            startTime: new Date('2025-11-06T08:00:00Z'),
            endTime: undefined,
            description: 'Initial description',
        },
    };

    beforeEach(async () => {
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

        await TestBed.configureTestingModule({
            imports: [EditPublicEventFormComponent],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: baseData },
                { provide: MatDialogRef, useValue: dialogRefSpy },
                { provide: PreachersService, useValue: {} },
                DatePipe,
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(EditPublicEventFormComponent);
        component = fixture.componentInstance;
        datePipe = TestBed.inject(DatePipe);
        fixture.detectChanges();
    });

    it('should create and initialize form with provided data', () => {
        expect(component).toBeTruthy();
        const title = component.publicEventForm.controls.title.value;
        expect(title).toBe(baseData.data.title);

        const startValue = component.publicEventForm.controls.startTime.value;
        // The component formats startTime using DatePipe 'yyyy-MM-dd hh:mm a'
        expect(startValue).toBe(
            datePipe.transform(baseData.data.startTime!, 'yyyy-MM-dd hh:mm a')
        );

        // endTime should be set (defaults to start + 3 hours if undefined)
        const expectedEnd = component.addHours(baseData.data.startTime!, 3);
        expect(component.publicEventForm.controls.endTime.value).toBe(
            datePipe.transform(expectedEnd, 'yyyy-MM-dd hh:mm a')
        );

        const desc = component.publicEventForm.controls.description.value;
        expect(desc).toBe(baseData.data.description!);
    });

    it('should update endTime to be startTime + 3 hours when startTime changes', () => {
        const newStartIso = '2025-11-10T05:30:00Z';
        // set an ISO string for startTime (subscription in ctor parses the string)
        component.publicEventForm.controls.startTime.setValue(newStartIso);
        // compute expected end and formatted string
        const startDate = new Date(newStartIso);
        const expectedEndDate = component.addHours(startDate, 3);
        const expectedFormatted = datePipe.transform(expectedEndDate, 'yyyy-MM-dd hh:mm a');

        expect(component.publicEventForm.controls.endTime.value).toBe(expectedFormatted);
    });

    it('save() should close dialog with converted PublicEventFormData when form is valid', () => {
        // set explicit values that are parseable by Date
        const startIso = '2025-11-20T09:00:00Z';
        const endIso = '2025-11-20T12:00:00Z';
        component.publicEventForm.controls.title.setValue('Saved Title');
        component.publicEventForm.controls.startTime.setValue(startIso);
        component.publicEventForm.controls.endTime.setValue(endIso);
        component.publicEventForm.controls.description.setValue('Saved description');

        component.save();

        expect(dialogRefSpy.close).toHaveBeenCalledTimes(1);
        const arg = dialogRefSpy.close.calls.mostRecent().args[0] as PublicEventFormData;
        expect(arg.mode).toBe(baseData.mode);
        expect(arg.type).toBe(baseData.type);
        expect(arg.data.id).toBe(baseData.data.id);
        expect(arg.data.title).toBe('Saved Title');
        expect(arg.data.description).toBe('Saved description');

        // replicate the component's toLocalDate behavior to compute expected Date objects
        const parseAndAdjust = (iso: string) => {
            const d = new Date(iso);
            const tzOffsetMs = d.getTimezoneOffset() * 60000;
            return new Date(d.getTime() - tzOffsetMs);
        };

        expect(arg.data.startTime instanceof Date).toBeTrue();
        expect((arg.data.startTime as Date).getTime()).toBe(parseAndAdjust(startIso).getTime());

        expect(arg.data.endTime instanceof Date).toBeTrue();
        expect((arg.data.endTime as Date)!.getTime()).toBe(parseAndAdjust(endIso).getTime());
    });

    it('save() should close with original formData when form is invalid', () => {
        // make form invalid by clearing required title
        component.publicEventForm.controls.title.setValue('');
        component.save();
        expect(dialogRefSpy.close).toHaveBeenCalledTimes(1);
        const calledWith = dialogRefSpy.close.calls.mostRecent().args[0] as PublicEventFormData;
        expect(calledWith).toBe(baseData);
    });

    it('close() should call dialogRef.close() with no args', () => {
        dialogRefSpy.close.calls.reset();
        component.close();
        expect(dialogRefSpy.close).toHaveBeenCalledWith();
    });
});