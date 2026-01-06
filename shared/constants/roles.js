
const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  RESELLER: 'reseller',
  RESELLER_ADMIN: 'reseller_admin',
  USER: 'user',
};


const PERMISSION_LEVELS = {
  SUPER_ADMIN: 4,
  RESELLER: 3,
  RESELLER_ADMIN: 3,
  USER: 1,
};


const ROLE_HIERARCHY = {
  [USER_ROLES.SUPER_ADMIN]: [USER_ROLES.RESELLER, USER_ROLES.RESELLER_ADMIN, USER_ROLES.USER],
  [USER_ROLES.RESELLER]: [USER_ROLES.USER],
  [USER_ROLES.RESELLER_ADMIN]: [USER_ROLES.USER],
  [USER_ROLES.USER]: [],
};


const ROLES_ARRAY = Object.values(USER_ROLES);


const canManageRole = (managerRole, targetRole) => {
  if (!managerRole || !targetRole) return false;
  const manageableRoles = ROLE_HIERARCHY[managerRole] || [];
  return manageableRoles.includes(targetRole);
};


const getRoleDisplayName = (role) => {
  if (!role) return 'User';
  return role
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};


const isAdminRole = (role) => {
  return role === USER_ROLES.SUPER_ADMIN || 
         role === USER_ROLES.RESELLER || 
         role === USER_ROLES.RESELLER_ADMIN;
};


const isSuperAdmin = (role) => {
  return role === USER_ROLES.SUPER_ADMIN;
};


const isReseller = (role) => {
  return role === USER_ROLES.RESELLER || role === USER_ROLES.RESELLER_ADMIN;
};


const normalizeRole = (role) => {
  if (!role) return USER_ROLES.USER;
  const normalized = role.toLowerCase().replace(/-/g, '_');
  return ROLES_ARRAY.includes(normalized) ? normalized : USER_ROLES.USER;
};

module.exports = {
  USER_ROLES,
  PERMISSION_LEVELS,
  ROLE_HIERARCHY,
  ROLES_ARRAY,
  canManageRole,
  getRoleDisplayName,
  isAdminRole,
  isSuperAdmin,
  isReseller,
  normalizeRole,
};
