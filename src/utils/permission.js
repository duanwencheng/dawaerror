// 权限管理工具

// 角色定义
export const ROLES = {
  ADMIN: '管理员',
  ENGINEER: '工程师',
  OBSERVER: '观察员'
}

// 权限定义
export const PERMISSIONS = {
  DELETE_FAULT: 'delete_fault',
  MODIFY_FAULT: 'modify_fault',
  ADD_FAULT: 'add_fault',
  VIEW_FAULT: 'view_fault',
  EXPORT_FAULT: 'export_fault',
  MANAGE_ROLES: 'manage_roles'
}

// 角色权限映射
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.DELETE_FAULT,
    PERMISSIONS.MODIFY_FAULT,
    PERMISSIONS.ADD_FAULT,
    PERMISSIONS.VIEW_FAULT,
    PERMISSIONS.EXPORT_FAULT,
    PERMISSIONS.MANAGE_ROLES
  ],
  [ROLES.ENGINEER]: [
    PERMISSIONS.MODIFY_FAULT,
    PERMISSIONS.ADD_FAULT,
    PERMISSIONS.VIEW_FAULT,
    PERMISSIONS.EXPORT_FAULT
  ],
  [ROLES.OBSERVER]: [
    PERMISSIONS.VIEW_FAULT,
    PERMISSIONS.EXPORT_FAULT
  ]
}

// 检查用户是否有指定权限
export const hasPermission = (user, permission) => {
  if (!user || !user.role) {
    return false
  }
  const userPermissions = ROLE_PERMISSIONS[user.role] || []
  return userPermissions.includes(permission)
}

// 检查用户是否为管理员
export const isAdmin = (user) => {
  return user && user.role === ROLES.ADMIN
}

// 检查用户是否可以修改故障
export const canModifyFault = (user, fault) => {
  if (isAdmin(user)) {
    return true
  }
  if (user.role === ROLES.ENGINEER) {
    // 工程师只能修改自己负责的故障
    return fault && (fault.responder === user.employeeId || fault.investigator === user.employeeId)
  }
  return false
}

// 检查用户是否可以删除故障
export const canDeleteFault = (user) => {
  return hasPermission(user, PERMISSIONS.DELETE_FAULT)
}

// 检查用户是否可以添加故障
export const canAddFault = (user) => {
  return hasPermission(user, PERMISSIONS.ADD_FAULT)
}

// 检查用户是否可以查看故障
export const canViewFault = (user) => {
  return hasPermission(user, PERMISSIONS.VIEW_FAULT)
}

// 检查用户是否可以导出故障
export const canExportFault = (user) => {
  return hasPermission(user, PERMISSIONS.EXPORT_FAULT)
}

// 检查用户是否可以管理角色
export const canManageRoles = (user) => {
  return hasPermission(user, PERMISSIONS.MANAGE_ROLES)
}