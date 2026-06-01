const fs = require('fs');
const path = 'src/layout/sidebar.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldMenuItems = "const menuItems = [
  { title: 'Imunoterapias', icon: Syringe, path: '/immunotherapies' },
  { title: 'Agendamentos', icon: CalendarDays, path: '/appointments' },
  { title: 'Dashboard', icon: BarChart3, path: '/dashboard' },
  { title: 'Configurações', icon: Settings, path: '/settings' },
];

const newMenuItems = "const menuItems = [
  { 
    title: 'Imunoterapias', 
    icon: Syringe, 
    path: '/immunotherapies',
    matchPaths: ['/add-immunotherapy']
  },
  { 
    title: 'Agendamentos', 
    icon: CalendarDays, 
    path: '/appointments',
    matchPaths: []
  },
  { 
    title: 'Dashboard', 
    icon: BarChart3, 
    path: '/dashboard',
    matchPaths: ['/export-report']
  },
  { 
    title: 'Configurações', 
    icon: Settings, 
    path: '/settings',
    matchPaths: [
      '/advanced-settings', 
      '/profile', 
      '/security', 
      '/plans', 
      '/teams', 
      '/personalization', 
      '/about', 
      '/help'
    ]
  },
];

content = content.replace(oldMenuItems, newMenuItems);

const oldIsActive = "const isActive = location.pathname === item.path";
const newIsActive = "const isActive = location.pathname === item.path || (item.matchPaths && item.matchPaths.some(p => location.pathname === p || location.pathname.startsWith(p + '/')))";

content = content.replace(oldIsActive, newIsActive);

fs.writeFileSync(path, content, 'utf8');
console.log('Sidebar updated');
