import { DatePipe } from '@angular/common';
import { Component, inject, signal, ViewEncapsulation } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
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
  readonly dialogData = signal(inject(MAT_DIALOG_DATA));
  readonly canEdit = signal(this.dialogData().canEdit);

  constructor(private dialogRef: MatDialogRef<EventOptionsComponent>) {}

  close() {
    this.dialogRef.close();
  }
  delete() {
    this.dialogRef.close({ action: 'delete', event: this.dialogData() });
  }
  edit() {
    this.dialogRef.close({ action: 'edit', event: this.dialogData() });
  }
}
