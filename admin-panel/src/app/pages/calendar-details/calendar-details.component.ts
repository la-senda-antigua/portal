import { Component, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, map, finalize, tap, shareReplay } from 'rxjs/operators';
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
// MatDialog removed — not used

@Component({
  selector: 'app-calendar-details',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatChipsModule, ReactiveFormsModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  templateUrl: './calendar-details.component.html',
  styleUrl: './calendar-details.component.scss',
  providers: [DatePipe],

})
export class CalendarDetailsComponent extends PageBaseComponent implements OnInit {
  currentCalendar?: CalendarDto | any;
  members: any[] = [];
  id: string | null = null;

  memberForm = new FormControl('');
  filteredOptions$!: Observable<any[]>;
  memberLoading: boolean = false;

  override tableTitle = '';
  constructor(service: CalendarsService, private usersService: UsersService, private router: Router, private route: ActivatedRoute, private location: Location) {
    super(service);
    this.id = this.route.snapshot.paramMap.get('id');

    const navName = (history && (history.state as any)?.name) || this.router.getCurrentNavigation()?.extras?.state?.['name'];
    if (navName) {
      this.tableTitle = navName;
    }
  }

  override ngOnInit() {
    this.load();

    this.filteredOptions$ = this.memberForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        if (!value || value.length < 2) {
          this.memberLoading = false;
          return of([]);
        }
        this.memberLoading = true;
        return this.usersService.search(value).pipe(
          map(res => (res && (res as any).items) ? (res as any).items : []),
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
    this.service.getById(this.id!).subscribe({
      next: (response) => {
        this.currentCalendar = response && (response as any).items ? (response as any).items?.[0] : response;
        const resolvedMembers = (response && (
          (response as any).members || (response as any).managers || (response as any).items?.[0]?.members || (response as any).items?.[0]?.managers
        ));
        this.members = Array.isArray(resolvedMembers) ? resolvedMembers : [];

        const resolvedName = (response && ((response as any).name || (response as any).items?.[0]?.name));
        if (resolvedName) {this.tableTitle = resolvedName;}
        this.isLoading.set(false)
      },
      error: (err) => {
        this.isLoading.set(false)
        this.handleException(err, 'There was an error loading my calendars.');
      }
    })
  }

  addMember(user: any) {
    console.log('Selected user to add:', user);
    if (!user) return;

    const exists = this.members.some(m => (m.id && user.id && m.id === user.id) || (m.username && user.username && m.username === user.username));
    if (exists) {
      this.snackBar.open('User already a member', '', { duration: 2000 });
      this.memberForm.setValue('');
      return;
    }

    this.members = [...this.members, user];
    this.memberForm.setValue('');

    const data = {
      calendarId: this.id as string,
      userId: user.id as string
    };

    (this.service as CalendarsService).addMember(data).subscribe({
      next: () => this.snackBar.open('Member added', '', { duration: 1500 }),
      error: (err) => {
        this.snackBar.open('Could not add member', '', { duration: 3000 });
        this.members = this.members.filter(m => m !== user);
      }
    });
  }

  onRemoveMember(member: any) {
    const memberLabel = member?.username || member?.name || member?.email || member;
    const confirmed = confirm(`¿Eliminar miembro ${memberLabel} del calendario?`);
    if (!confirmed) return;

    // prepare updated members array
    const newMembers = this.members.filter((m) => {
      if (m && m.id !== undefined && member && member.id !== undefined) {
        return m.id !== member.id;
      }
      // fallback compare by username or JSON
      if (m?.username && member?.username) return m.username !== member.username;
      return JSON.stringify(m) !== JSON.stringify(member);
    });

    // try to build updated calendar object
    const updatedCalendar: CalendarDto | any = {
      ...(this.currentCalendar || { id: this.id }),
      // keep property name consistent with source if possible
      managers: newMembers,
      members: newMembers,
    };

    // call edit to persist changes
    this.service.edit(updatedCalendar).subscribe({
      next: () => {
        this.members = newMembers;
      },
      error: (err) => this.handleException(err, 'No se pudo eliminar el miembro.'),
    });
  }

  // create form removed for this page

  goBack(){
    this.location.back();
  }
}
