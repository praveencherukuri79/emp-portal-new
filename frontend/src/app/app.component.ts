import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { ResponsiveLayoutComponent } from './core/layout/responsive-layout/responsive-layout.component';
import { ThemeService } from './core/services/theme.service';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ResponsiveLayoutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend';
  showLayout = true;

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private notificationService: NotificationService
  ) {
    // Initialize theme (reads from localStorage or uses default)
    this.themeService.init();
    
    // Initialize notification unread count
    this.notificationService.initializeUnreadCount();
    
    // Hide layout for auth pages
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.showLayout = !event.url.includes('/auth/');
      });
  }
}
