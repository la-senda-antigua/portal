import { Component, viewChild } from '@angular/core';
import { TableViewComponent, TableViewColumn } from '../../components/table-view/table-view.component';
import { PageBaseComponent } from '../page-base/page-base.component';
import { CalendarsService } from '../../services/calendars.service';
import { DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CalendarDto } from '../../models/CalendarDto';

@Component({
  selector: 'app-calendar-details',
  imports: [TableViewComponent],
  templateUrl: './calendar-details.component.html',
  styleUrl: './calendar-details.component.scss',
  providers: [DatePipe],

})
export class CalendarDetailsComponent extends PageBaseComponent {

  override tableViewComponent = viewChild(TableViewComponent);
  override tableCols: TableViewColumn[] = [
    { displayName: 'Name', datasourceName: 'name' },
    {
      displayName: 'Shared with',
      datasourceName: 'members',
      displayProperty: 'username',
      isArray: true,
    },
  ];

  id: string | null = null;
  override tableTitle = 'My Calendars';
  constructor(service: CalendarsService, private router: Router, private route: ActivatedRoute) {
    super(service);
    this.id = this.route.snapshot.paramMap.get('id');

    const navName = (history && (history.state as any)?.name) || this.router.getCurrentNavigation()?.extras?.state?.['name'];
    if (navName) {
      this.tableTitle = navName;
    }
  }


  override load(): void {
    this.isLoading.set(true);
    this.service.getById(this.id!).subscribe({
      next: (response) => {
        const resolvedName = (response && ((response as any).name || (response as any).items?.[0]?.name));
        if (resolvedName) {
          this.tableTitle = resolvedName;
        }

        const items = response.items.map((c: CalendarDto) => ({
          id: c.id,
          name: c.name,
          managers: c.managers,
          active: c.active
        }))

        this.dataSource.set({
          page: response.page,
          pageSize: response.pageSize,
          totalItems: response.totalItems,
          columns: this.tableCols,
          items
        });

        this.isLoading.set(false)
      },
      error: (err) => {
        this.handleException(err, 'There was an error loading my calendars.');
      }
    })
  }



}
