import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'lsa-home',
    imports: [],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent { }
