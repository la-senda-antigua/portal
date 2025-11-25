import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-user-groups',
  imports: [MatExpansionModule, MatIconModule, MatButtonModule],
  templateUrl: './user-groups.component.html',
  styleUrl: './user-groups.component.scss'
})
export class UserGroupsComponent {
  readonly panelOpenState = signal(false);

}
