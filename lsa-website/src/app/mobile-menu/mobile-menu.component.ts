import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import {MatTreeModule} from '@angular/material/tree';



@Component({
  selector: 'lsa-mobile-menu',
  imports: [
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    CommonModule,
  ],
  templateUrl: './mobile-menu.component.html',
  styleUrl: './mobile-menu.component.scss'
})
export class MobileMenuComponent {
  @Input() options: any[] = [];
  
  treeControl = new NestedTreeControl<any>(node => node.options);
  dataSource = new MatTreeNestedDataSource<any>();

  ngOnInit() {
    this.dataSource.data = this.options;
    console.log(this.options)
  }

  hasChild = (_: number, node: any) => {
    console.log('checking node:', node.text, node.options);
    return Array.isArray(node.options) && node.options.length > 0;
  };
  

}
