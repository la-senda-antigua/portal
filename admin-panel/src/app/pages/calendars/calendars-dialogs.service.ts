import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { AddEventDialogComponent } from '../../components/add-event-dialog/add-event-dialog.component';
import {
  DeleteConfirmationComponent,
  DeleteConfirmationData,
} from '../../components/delete-confirmation/delete-confirmation.component';
import {
  CalendarFormData,
  EditCalendarFormComponent,
} from '../../components/edit-calendar-form/edit-calendar-form.component';
import { EventOptionsComponent } from '../../components/event-options/event-options.component';
import { ExtendedCalendar } from './calendars.facade';

@Injectable({ providedIn: 'root' })
export class CalendarsDialogsService {
  private readonly dialog = inject(MatDialog);

  openEditCalendarDialog(calendar: ExtendedCalendar): Observable<any> {
    const dialogRef = this.dialog.open(EditCalendarFormComponent, {
      width: '450px',
      maxHeight: '80vh',
      data: {
        mode: 'edit',
        type: 'calendar',
        data: { ...calendar },
      } as CalendarFormData,
    });

    return dialogRef.afterClosed();
  }

  openAddCalendarDialog(): Observable<any> {
    const dialogRef = this.dialog.open(EditCalendarFormComponent, {
      data: {
        mode: 'add',
        type: 'calendar',
        data: {},
      } as CalendarFormData,
    });

    return dialogRef.afterClosed();
  }

  openAddOrEditEventDialog(calendars: any[], eventData?: any): Observable<any> {
    const dialogRef = this.dialog.open(AddEventDialogComponent, {
      width: '500px',
      maxHeight: '95vh',
      data: {
        calendars,
        event: eventData,
      },
    });

    return dialogRef.afterClosed();
  }

  openEventOptionsDialog(event: any, top: number, left: number): Observable<any> {
    const dialogRef = this.dialog.open(EventOptionsComponent, {
      data: event,
      width: '400px',
      panelClass: 'event-options-panel',
      position: {
        top: `${top}px`,
        left: `${left}px`,
      },
    });

    return dialogRef.afterClosed();
  }

  openDeleteConfirmationDialog(data: DeleteConfirmationData): Observable<boolean> {
    const dialogRef = this.dialog.open(DeleteConfirmationComponent, {
      data,
    });

    return dialogRef.afterClosed();
  }
}
