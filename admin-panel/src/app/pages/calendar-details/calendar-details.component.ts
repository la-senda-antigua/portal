import { Component, OnInit, inject, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { forkJoin, Observable, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  map,
  finalize,
  tap,
  shareReplay,
} from 'rxjs/operators';
import { UsersService } from '../../services/users.service';
import { CalendarsService } from '../../services/calendars.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageBaseComponent } from '../page-base/page-base.component';
import { DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CalendarDto } from '../../models/CalendarDto';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TableViewColumn, TableViewComponent } from '../../components/table-view/table-view.component';
import { CalendarMemberDto } from '../../models/CalendarMemberDto';
import { CalendarEvent } from '../../models/CalendarEvent';

@Component({
  selector: 'app-calendar-details',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    TableViewComponent,
  ],
  templateUrl: './calendar-details.component.html',
  styleUrl: './calendar-details.component.scss',
  providers: [DatePipe],
})
export class CalendarDetailsComponent
  extends PageBaseComponent
  implements OnInit
{
  override tableViewComponent = viewChild(TableViewComponent);
  override tableCols: TableViewColumn[] = [
    { displayName: 'Title', datasourceName: 'title' },
  ];

  currentCalendar?: CalendarDto;
  members: CalendarMemberDto[] = [];
  id: string | null = null;
  memberForm = new FormControl('');
  filteredMembers$!: Observable<any[]>;
  memberLoading: boolean = false;
  calendarEvents: CalendarEvent[] = [];

  constructor(
    service: CalendarsService,
    private usersService: UsersService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {
    super(service);
    this.id = this.route.snapshot.paramMap.get('id');

    const navName = (history && (history.state as any)?.name) || this.router.getCurrentNavigation()?.extras?.state?.['name'];
    if (navName) {this.tableTitle = navName;}
  }

  override ngOnInit() {
    this.load();

    this.filteredMembers$ = this.memberForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value) => {
        if (!value || value.length < 2) {
          this.memberLoading = false;
          return of([]);
        }
        this.memberLoading = true;
        return this.usersService.search(value).pipe(
          map((res) => (res && (res as any).items ? (res as any).items : [])),
          tap(() => (this.memberLoading = false)), // turn off loading when data arrives
          catchError(() => of([])),
          finalize(() => (this.memberLoading = false)) // safety net: turn off if error
        );
      }),
      shareReplay(1) // cache last result and prevent duplicate subscriptions
    );
  }

  override load(): void {
    this.isLoading.set(true);

    forkJoin({
      calendar: this.service.getById(this.id!),
      events: (this.service as CalendarsService).getCalendarEvent(this.id!)
    }).subscribe({
      next: ({ calendar, events }) => {
        this.currentCalendar = calendar;
        this.members = calendar.members as CalendarMemberDto[];
        if (calendar.name) {
          this.tableTitle = calendar.name;
        }
        this.calendarEvents = events;
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.handleException(err, 'There was an error loading calendar data.');
      }
    });

  }

  addMember(user: CalendarMemberDto) {
    if (!user) return;
    const exists = this.members.some(m => (
      (m.userId && user.userId && m.userId === user.userId) ||
      (m.username && user.username && m.username === user.username)
    ));
    if (exists) {
      this.snackBar.open('User already a member', '', { duration: 2000 });
      this.memberForm.setValue('');
      return;
    }

    this.members = [...this.members, user];
    this.memberForm.setValue('');

    const data : CalendarMemberDto = {
      calendarId: this.id as string,
      userId: user.userId as string,
    };

    (this.service as CalendarsService).addMember(data).subscribe({
      next: () => this.snackBar.open('Member added', '', { duration: 1500 }),
      error: (err) => {
        this.snackBar.open('Could not add member', '', { duration: 3000 });
        this.members = this.members.filter((m) => m !== user);
      },
    });
  }

  onRemoveMember(member: CalendarMemberDto) {
    const confirmed = confirm(`¿Remove member ${member.username}?`);
    if (!confirmed) return;

    const data : CalendarMemberDto = {
      calendarId: this.id as string,
      userId: member.userId as string,
    };
    (this.service as CalendarsService).removeMember(data).subscribe({
      next: () => {
        this.members = this.members.filter((m) => m.userId !== member.userId);
        this.snackBar.open('Member removed successfully', '', {duration: 1500,});
      },
      error: (err) =>
        this.handleException(err, 'No se pudo eliminar el miembro.'),
    });
  }

  goBack() {
    this.location.back();
  }
}
