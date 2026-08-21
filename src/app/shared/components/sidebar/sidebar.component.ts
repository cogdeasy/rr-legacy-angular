import { Component, Input } from '@angular/core';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() isCollapsed = false;

  navItems: NavItem[] = [
    { label: 'Fleet dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Engine explorer', icon: 'travel_explore', route: '/engine-explorer' },
    { label: 'Health trending', icon: 'show_chart', route: '/health-trending' },
    { label: 'Shop visit planner', icon: 'build_circle', route: '/shop-visit-planner' },
    { label: 'Work orders', icon: 'assignment', route: '/work-orders' },
    { label: 'Profile', icon: 'person_outline', route: '/profile' }
  ];
}
