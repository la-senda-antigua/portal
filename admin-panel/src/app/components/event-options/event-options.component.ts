import { DatePipe } from '@angular/common';
import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-event-options',
  imports: [MatDialogModule, DatePipe, MatButtonModule, MatIconModule],
  templateUrl: './event-options.component.html',
  styleUrl: './event-options.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class EventOptionsComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EventOptionsComponent>
  ) {

  }

  close() {
    this.dialogRef.close();
  }
  delete() {
    this.dialogRef.close({ action: 'delete', event: this.data });
  }
  edit() {
    this.dialogRef.close({ action: 'edit', event: this.data });
  }
}
