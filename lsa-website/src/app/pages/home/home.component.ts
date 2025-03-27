import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AppConfigService } from 'src/app/app-config.service';

@Component({
    selector: 'lsa-home',
    standalone: true,
    imports: [],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
    constructor(private configService: AppConfigService, private titleService: Title) {
        const homePageConfig = this.configService.appConfig()?.pages.find(page => page.name === 'home');
        
        if (!homePageConfig) {
            return; // TODO: if homePageConfig is undefined, redirect to 404 page
        }
        
        this.titleService.setTitle(homePageConfig?.title)
    }

 }
