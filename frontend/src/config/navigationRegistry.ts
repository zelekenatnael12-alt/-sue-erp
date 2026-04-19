/**
 * Navigation Registry
 * Centralizes sidebar configurations for all portals
 */

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  end?: boolean;
}

export interface PortalConfig {
  title: string;
  subTitle: string;
  icon: string;
  basePath: string;
  items: NavItem[];
}

export const NAVIGATION_REGISTRY: Record<string, PortalConfig> = {
  AREA: {
    title: 'SU Ethiopia',
    subTitle: 'Area Portal',
    icon: 'location_on',
    basePath: '/area',
    items: [
      { label: 'Dashboard', path: '/area/home', icon: 'dashboard', end: true },
      { label: 'Weekly Progress', path: '/area/weekly', icon: 'edit_note' },
      { label: 'Planning & Reports', path: '/area/planning', icon: 'calendar_today' },
      { label: 'School Intel', path: '/area/intelligence', icon: 'visibility' },
      { label: 'PSR Hub', path: '/area/psr', icon: 'currency_exchange' },
      { label: 'Volunteers', path: '/area/volunteers', icon: 'group' },
    ]
  },
  SUB_REGIONAL: {
    title: 'SU Ethiopia',
    subTitle: 'Sub-Regional Portal',
    icon: 'hub',
    basePath: '/sub-regional',
    items: [
      { label: 'Dashboard', path: '/sub-regional/home', icon: 'dashboard', end: true },
      { label: 'Team Approvals', path: '/sub-regional/approvals', icon: 'fact_check' },
      { label: 'Network', path: '/sub-regional/network', icon: 'lan' },
      { label: 'Create Event', path: '/sub-regional/create-event', icon: 'event' },
      { label: 'Proxy Entry', path: '/sub-regional/proxy-school', icon: 'input' },
    ]
  },
  REGIONAL: {
    title: 'SU Ethiopia',
    subTitle: 'Regional Portal',
    icon: 'map',
    basePath: '/regional',
    items: [
      { label: 'Dashboard', path: '/regional/home', icon: 'dashboard', end: true },
      { label: 'Asset Registry', path: '/regional/assets', icon: 'inventory' },
      { label: 'Advisory Board', path: '/regional/advisory', icon: 'groups' },
      { label: 'Structural Review', path: '/regional/structural-review', icon: 'account_tree' },
      { label: 'Approvals', path: '/regional/approvals', icon: 'assignment_turned_in' },
      { label: 'Strategy', path: '/under-construction', icon: 'insights' },
    ]
  },
  ASSOCIATE: {
    title: 'SU Ethiopia',
    subTitle: 'Associate Portal',
    icon: 'person_field',
    basePath: '/associate',
    items: [
      { label: 'Dashboard', path: '/associate/home', icon: 'dashboard', end: true },
      { label: 'Register School', path: '/associate/register-school', icon: 'add_business' },
      { label: 'Weekly Progress', path: '/associate/weekly', icon: 'edit_note' },
      { label: 'Volunteers', path: '/associate/volunteers', icon: 'group' },
    ]
  },
  NATIONAL: {
    title: 'SU Ethiopia',
    subTitle: 'National Hub',
    icon: 'public',
    basePath: '/national',
    items: [
      { label: 'National Matrix', path: '/national', icon: 'analytics', end: true },
      { label: 'Regional Hubs', path: '/admin/overview', icon: 'hub' },
      { label: 'Strategic Plans', path: '/under-construction', icon: 'description' },
      { label: 'Declarations', path: '/under-construction', icon: 'campaign' },
    ]
  },
  ADMIN: {
    title: 'SU Ethiopia',
    subTitle: 'Admin Command',
    icon: 'admin_panel_settings',
    basePath: '/admin',
    items: [
      { label: 'Overview', path: '/admin/overview', icon: 'dashboard', end: true },
      { label: 'Analytics', path: '/admin/analytics', icon: 'bar_chart' },
      { label: 'Users', path: '/admin/users', icon: 'manage_accounts' },
      { label: 'Staff', path: '/admin/staff', icon: 'badge' },
      { label: 'Events', path: '/admin/events', icon: 'event' },
      { label: 'Financials', path: '/admin/financials', icon: 'account_balance' },
      { label: 'Announcements', path: '/admin/announcements', icon: 'campaign' },
    ]
  },
  FINANCE: {
    title: 'SU Ethiopia',
    subTitle: 'Finance Engine',
    icon: 'payments',
    basePath: '/finance',
    items: [
      { label: 'Dashboard', path: '/finance', icon: 'dashboard', end: true },
      { label: 'HR Provisioning', path: '/finance#hr', icon: 'person_add' },
      { label: 'Master Ledger', path: '/finance#ledger', icon: 'menu_book' },
      { label: 'Payroll', path: '/under-construction', icon: 'receipt_long' },
    ]
  },
  SCHOOL_MINISTRY: {
    title: 'SU Ethiopia',
    subTitle: 'Ministry Core',
    icon: 'school',
    basePath: '/school-ministry',
    items: [
      { label: 'Ministry Health', path: '/school-ministry', icon: 'monitor_heart', end: true },
      { label: 'Operations Desk', path: '/school-ministry/operations', icon: 'settings_suggest' },
      { label: 'Staff Roster', path: '/school-ministry#staff', icon: 'badge' },
    ]
  },
  MEDIA: {
    title: 'SU Ethiopia',
    subTitle: 'Media Hub',
    icon: 'emergency_share',
    basePath: '/media',
    items: [
      { label: 'Broadcasting', path: '/media', icon: 'radio', end: true },
      { label: 'Reach Analytics', path: '/media#stats', icon: 'trending_up' },
    ]
  }
};
