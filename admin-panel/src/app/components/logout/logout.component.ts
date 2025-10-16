import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [MatIconModule, MatDialogModule, MatButtonModule],
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoutComponent {
  @ViewChild('logoutDialog') logoutDialog!: TemplateRef<any>;

  constructor(private dialog: MatDialog, private authService: AuthService) {}

  logout() {
    const dialogRef = this.dialog.open(this.logoutDialog);

    dialogRef.afterClosed().subscribe((result) => {      
      if (result === 'confirm') {
        this.authService.logout()
      }
    });
  }
}
