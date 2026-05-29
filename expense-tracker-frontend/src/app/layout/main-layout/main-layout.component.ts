import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Observable, filter, map, startWith } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuModule } from 'primeng/menu';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenubarModule } from 'primeng/menubar';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../core/services/auth.service';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    AvatarModule,
    ButtonModule,
    MenuModule,
    PanelMenuModule,
    MenubarModule,
    BreadcrumbModule,
    ProgressBarModule,
    TooltipModule,
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private loadingService = inject(LoadingService);

  menuItems: MenuItem[] = [];
  userMenu: MenuItem[] = [];
  homeBreadcrumb: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  sidebarVisible = true;
  isDarkMode = false;

  currentUser$ = this.authService.currentUser$;
  loading$ = this.loadingService.loading$;

  breadcrumbItems$: Observable<MenuItem[]> = this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    startWith(null),
    map(() => this.computeBreadcrumb(this.router.url))
  );

  ngOnInit(): void {
    const saved = localStorage.getItem('darkMode');
    if (saved === 'true') {
      this.isDarkMode = true;
      document.documentElement.classList.add('dark-mode');
    }

    this.menuItems = [
      { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/dashboard' },
      { label: 'Transactions', icon: 'pi pi-list', routerLink: '/transactions' },
      { label: 'Categories', icon: 'pi pi-tags', routerLink: '/categories' },
      { label: 'Budgets', icon: 'pi pi-wallet', routerLink: '/budgets' },
      { label: 'Analytics', icon: 'pi pi-chart-bar', routerLink: '/analytics' },
      { label: 'Recurring', icon: 'pi pi-sync', routerLink: '/recurring' },
      { label: 'Reports', icon: 'pi pi-file-export', routerLink: '/reports' },
    ];

    this.userMenu = [
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => this.logout(),
      },
    ];
  }

  private computeBreadcrumb(url: string): MenuItem[] {
    if (url.includes('dashboard')) return [{ label: 'Dashboard' }];
    if (url.includes('transactions')) return [{ label: 'Transactions' }];
    if (url.includes('categories')) return [{ label: 'Categories' }];
    if (url.includes('budgets')) return [{ label: 'Budgets' }];
    if (url.includes('analytics')) return [{ label: 'Analytics' }];
    if (url.includes('recurring')) return [{ label: 'Recurring' }];
    if (url.includes('reports')) return [{ label: 'Reports' }];
    return [];
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('dark-mode', this.isDarkMode);
    localStorage.setItem('darkMode', String(this.isDarkMode));
  }

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

  logout(): void {
    this.authService.logout();
  }
}
