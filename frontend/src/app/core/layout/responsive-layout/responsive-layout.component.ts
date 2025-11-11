import { Component, computed, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';
import { TopnavComponent } from '../topnav/topnav.component';
import { MobileNavComponent } from '../mobile-nav/mobile-nav.component';

@Component({
  selector: 'app-responsive-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    TopnavComponent,
    MobileNavComponent
  ],
  templateUrl: './responsive-layout.component.html',
  styleUrls: ['./responsive-layout.component.scss']
})
export class ResponsiveLayoutComponent implements OnInit, OnDestroy {
  private breakpointObserver = inject(BreakpointObserver);
  isDesktop = signal(true);
  isTablet = signal(false);
  isMobile = signal(false);
  private subscription?: Subscription;

  ngOnInit(): void {
    this.subscription = this.breakpointObserver.observe([
      Breakpoints.Handset,
      Breakpoints.Tablet,
      Breakpoints.Web
    ]).subscribe(result => {
      const breakpoints = result.breakpoints;
      this.isMobile.set(breakpoints[Breakpoints.Handset]);
      this.isTablet.set(breakpoints[Breakpoints.Tablet]);
      this.isDesktop.set(breakpoints[Breakpoints.Web] || (!breakpoints[Breakpoints.Handset] && !breakpoints[Breakpoints.Tablet]));
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}

