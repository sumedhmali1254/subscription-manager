import { ROLES } from './roles';

export const ADMIN_NAVIGATION = [
  {
    group: 'WORKSPACE',
    items: [
      {
        name: 'Dashboard',
        path: '/dashboard',
        icon: 'LayoutDashboard',
        roles: [ROLES.ADMIN, ROLES.STAFF],
      },
      {
        name: 'Customers',
        path: '/customers',
        icon: 'Users',
        roles: [ROLES.ADMIN, ROLES.STAFF],
      },
      {
        name: 'Products',
        path: '/products',
        icon: 'Package',
        roles: [ROLES.ADMIN, ROLES.STAFF],
        children: [
          { name: 'All Products', path: '/products', icon: 'Package' },
          { name: 'Variants', path: '/product-variants', icon: 'Layers' },
        ],
      },
      {
        name: 'Subscriptions',
        path: '/subscriptions',
        icon: 'Repeat',
        roles: [ROLES.ADMIN, ROLES.STAFF],
        children: [
          { name: 'All Subscriptions', path: '/subscriptions', icon: 'Repeat' },
          { name: 'Plans', path: '/plans', icon: 'Layers' },
        ],
      },
    ],
  },
  {
    group: 'SALES & BILLING',
    items: [
      {
        name: 'Quotations',
        path: '/quotations',
        icon: 'FileText',
        roles: [ROLES.ADMIN, ROLES.STAFF],
        children: [
          { name: 'All Quotes', path: '/quotations', icon: 'FileText' },
          { name: 'Templates', path: '/quotation-templates', icon: 'FileCode' },
        ],
      },
      {
        name: 'Invoices',
        path: '/invoices',
        icon: 'Receipt',
        roles: [ROLES.ADMIN, ROLES.STAFF],
      },
      {
        name: 'Payments',
        path: '/payments',
        icon: 'CreditCard',
        roles: [ROLES.ADMIN, ROLES.STAFF],
      },
      {
        name: 'Discounts',
        path: '/discounts',
        icon: 'Percent',
        roles: [ROLES.ADMIN, ROLES.STAFF],
      },
      {
        name: 'Taxes',
        path: '/taxes',
        icon: 'Calculator',
        roles: [ROLES.ADMIN],
      },
      {
        name: 'Billing Runs',
        path: '/billing-runs',
        icon: 'PlayCircle',
        roles: [ROLES.ADMIN, ROLES.STAFF],
      },
    ],
  },
  {
    group: 'INSIGHTS',
    items: [
      {
        name: 'Reports',
        path: '/reports',
        icon: 'BarChart3',
        roles: [ROLES.ADMIN, ROLES.STAFF],
      },
      {
        name: 'Audit Logs',
        path: '/audit-logs',
        icon: 'ShieldCheck',
        roles: [ROLES.ADMIN],
      },
    ],
  },
  {
    group: 'ADMINISTRATION',
    items: [
      {
        name: 'Users',
        path: '/users',
        icon: 'UserCheck',
        roles: [ROLES.ADMIN],
      },
      {
        name: 'Settings',
        path: '/settings',
        icon: 'Settings',
        roles: [ROLES.ADMIN],
      },
    ],
  },
];

export const CUSTOMER_NAVIGATION = [
  {
    name: 'Customer Portal',
    path: '/portal',
    icon: 'LayoutDashboard',
  },
  {
    name: 'My Subscriptions',
    path: '/portal/subscriptions',
    icon: 'Repeat',
  },
  {
    name: 'Browse Plans',
    path: '/portal/plans',
    icon: 'Layers',
  },
  {
    name: 'My Quotations',
    path: '/portal/quotations',
    icon: 'FileText',
  },
  {
    name: 'My Invoices',
    path: '/portal/invoices',
    icon: 'Receipt',
  },
  {
    name: 'Payment History',
    path: '/portal/payments',
    icon: 'CreditCard',
  },
  {
    name: 'My Profile & Billing',
    path: '/portal/profile',
    icon: 'User',
  },
];
