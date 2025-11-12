import { Component, computed, signal, effect, inject, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
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
  private elementRef = inject(ElementRef);
  
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
          route: '/employer/approvals',
          roles: [UserRole.EMPLOYER]
        },
        {
          label: 'Leave Approvals',
          icon: 'event_available',
          route: '/employer/approvals',
          roles: [UserRole.EMPLOYER]
        },
        {
          label: 'Timesheet Approvals',
          icon: 'schedule',
          route: '/supervisor/approvals',
          roles: [UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN]
        },
        {
          label: 'Leave Approvals',
          icon: 'event_available',
          route: '/supervisor/approvals',
          roles: [UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN]
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
        // Close all menus on navigation
        this.expandedMenus.set(new Set());
      });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInside = this.elementRef.nativeElement.contains(target);
    
    if (!clickedInside) {
      // Close all menus if clicked outside
      this.expandedMenus.set(new Set());
    } else {
      // Check if clicked on a regular nav link (not dropdown trigger or menu)
      const isDropdownTrigger = target.closest('.topnav__dropdown-trigger');
      const isDropdownMenu = target.closest('.topnav__dropdown-menu');
      const isRegularNavLink = target.closest('.topnav__link:not(.topnav__dropdown-trigger)');
      
      // Only close menus if clicking a regular nav link (not dropdown trigger or menu)
      if (isRegularNavLink && !isDropdownTrigger && !isDropdownMenu) {
        this.expandedMenus.set(new Set());
      }
    }
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  updateActiveRoute(): void {
    const url = this.router.url.split('?')[0]; // Remove query params
    this.activeRoute.set(url);
    
    // Auto-expand parent menu if child route is active
    const user = this.currentUser();
    if (user) {
      const visibleItems = this.getVisibleNavItems();
      visibleItems.forEach(item => {
        if (item.children) {
          const hasActiveChild = item.children.some(child => {
            if (child.route === '') return false;
            return url.startsWith(child.route);
          });
          if (hasActiveChild) {
            const expanded = new Set(this.expandedMenus());
            expanded.add(item.label);
            this.expandedMenus.set(expanded);
          }
        }
      });
    }
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
    const currentRoute = this.activeRoute();
    
    if (route === '') {
      return currentRoute === '/' || currentRoute === '';
    }
    
    // Exact match
    if (currentRoute === route) {
      return true;
    }
    
    // For parent routes with children, check if current route starts with parent
    // But also check if it's a child route
    if (currentRoute.startsWith(route)) {
      // For employer routes, check if it's actually an employer route
      if (route.startsWith('/employer')) {
        return currentRoute.startsWith('/employer');
      }
      // For other routes, check if it's a direct child
      const routeParts = route.split('/').filter(p => p);
      const currentParts = currentRoute.split('/').filter(p => p);
      
      // If route is a parent (e.g., /admin), check if current is a child
      if (routeParts.length === 1 && currentParts.length > 1) {
        return currentParts[0] === routeParts[0];
      }
      
      return true;
    }
    
    return false;
  }

  toggleMenu(menuLabel: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    const expanded = new Set(this.expandedMenus());
    if (expanded.has(menuLabel)) {
      // Close this menu
      expanded.delete(menuLabel);
    } else {
      // Close all other menus first, then open this one
      expanded.clear();
      expanded.add(menuLabel);
    }
    this.expandedMenus.set(expanded);
  }

  navigateAndClose(menuLabel: string, route: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    // Close the menu
    const expanded = new Set(this.expandedMenus());
    expanded.delete(menuLabel);
    this.expandedMenus.set(expanded);
    
    // Navigate - split route and query params if needed
    const [path, query] = route.split('?');
    const navigationExtras = query ? { queryParams: Object.fromEntries(new URLSearchParams(query)) } : {};
    
    this.router.navigate([path], navigationExtras).catch(err => {
      console.error('Navigation error:', err);
    });
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
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        // Even if logout fails, navigate to login
        this.router.navigate(['/auth/login']);
      }
    });
  }
}

