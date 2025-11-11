import { Component, computed, signal, effect, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { NotificationDropdownComponent } from '../../../shared/components/notification-dropdown/notification-dropdown.component';
import { UserRole } from '../../models/user.model';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: UserRole[];
  children?: NavItem[];
}

@Component({
  selector: 'app-topnav',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    NotificationDropdownComponent
  ],
  templateUrl: './topnav.component.html',
  styleUrls: ['./topnav.component.scss']
})
export class TopnavComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  public themeService = inject(ThemeService);
  
  currentUser = computed(() => this.authService.currentUser());
  activeRoute = signal<string>('');
  expandedMenus = signal<Set<string>>(new Set());
  private routerSubscription?: Subscription;

  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '',
      roles: [UserRole.PROSPECT, UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER]
    },
    {
      label: 'Timesheets',
      icon: 'schedule',
      route: '/employee/timesheets',
      roles: [UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN]
    },
    {
      label: 'Leaves',
      icon: 'event_available',
      route: '/employee/leaves',
      roles: [UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN]
    },
    {
      label: 'Documents',
      icon: 'folder',
      route: '/employee/documents',
      roles: [UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN]
    },
    {
      label: 'Approvals',
      icon: 'approval',
      route: '/supervisor/approvals',
      roles: [UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER],
      children: [
        {
          label: 'Timesheet Approvals',
          icon: 'schedule',
          route: '/supervisor/approvals?type=timesheet',
          roles: [UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER]
        },
        {
          label: 'Leave Approvals',
          icon: 'event_available',
          route: '/supervisor/approvals?type=leave',
          roles: [UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN, UserRole.EMPLOYER]
        }
      ]
    },
    {
      label: 'Team',
      icon: 'groups',
      route: '/supervisor/team',
      roles: [UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN]
    },
    {
      label: 'HR',
      icon: 'business_center',
      route: '/hr',
      roles: [UserRole.HR, UserRole.ADMIN],
      children: [
        {
          label: 'Employees',
          icon: 'people',
          route: '/hr/employees',
          roles: [UserRole.HR, UserRole.ADMIN]
        },
        {
          label: 'Leave Management',
          icon: 'event_available',
          route: '/hr/leaves',
          roles: [UserRole.HR, UserRole.ADMIN]
        },
        {
          label: 'Documents',
          icon: 'folder_special',
          route: '/hr/documents',
          roles: [UserRole.HR, UserRole.ADMIN]
        }
      ]
    },
    {
      label: 'Admin',
      icon: 'admin_panel_settings',
      route: '/admin',
      roles: [UserRole.ADMIN],
      children: [
        {
          label: 'Users',
          icon: 'manage_accounts',
          route: '/admin/users',
          roles: [UserRole.ADMIN]
        },
        {
          label: 'Roles',
          icon: 'shield',
          route: '/admin/roles',
          roles: [UserRole.ADMIN]
        },
        {
          label: 'Settings',
          icon: 'settings',
          route: '/admin/settings',
          roles: [UserRole.ADMIN]
        }
      ]
    },
    {
      label: 'Business',
      icon: 'insights',
      route: '/employer/dashboard',
      roles: [UserRole.EMPLOYER],
      children: [
        {
          label: 'Approvals',
          icon: 'approval',
          route: '/employer/approvals',
          roles: [UserRole.EMPLOYER]
        },
        {
          label: 'Users',
          icon: 'manage_accounts',
          route: '/employer/users',
          roles: [UserRole.EMPLOYER]
        },
        {
          label: 'Settings',
          icon: 'settings',
          route: '/employer/settings',
          roles: [UserRole.EMPLOYER]
        },
        {
          label: 'Financial Reports',
          icon: 'attach_money',
          route: '/employer/financial',
          roles: [UserRole.EMPLOYER]
        },
        {
          label: 'Analytics',
          icon: 'analytics',
          route: '/employer/analytics',
          roles: [UserRole.EMPLOYER]
        },
        {
          label: 'Workforce',
          icon: 'work',
          route: '/employer/workforce',
          roles: [UserRole.EMPLOYER]
        }
      ]
    }
  ];

  ngOnInit(): void {
    this.updateActiveRoute();
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateActiveRoute();
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  updateActiveRoute(): void {
    this.activeRoute.set(this.router.url);
  }

  getVisibleNavItems(): NavItem[] {
    const user = this.currentUser();
    if (!user) return [];
    return this.navItems.filter(item => item.roles.includes(user.role));
  }

  hasAccess(roles: UserRole[]): boolean {
    const user = this.currentUser();
    return user ? roles.includes(user.role) : false;
  }

  isActive(route: string): boolean {
    if (route === '') {
      return this.activeRoute() === '/' || this.activeRoute() === '';
    }
    return this.activeRoute().startsWith(route);
  }

  toggleMenu(menuLabel: string): void {
    const expanded = new Set(this.expandedMenus());
    if (expanded.has(menuLabel)) {
      expanded.delete(menuLabel);
    } else {
      expanded.add(menuLabel);
    }
    this.expandedMenus.set(expanded);
  }

  isMenuExpanded(menuLabel: string): boolean {
    return this.expandedMenus().has(menuLabel);
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return 'U';
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  }

  getRoleName(): string {
    const user = this.currentUser();
    return user?.role?.toLowerCase().replace('_', ' ') || 'User';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}

