export function canUpload(role) {

  return [
    'super_admin',
    'owner',
    'manager',
    'editor'
  ].includes(role)
}

export function canDelete(role) {

  return [
    'super_admin',
    'owner',
    'manager'
  ].includes(role)
}

export function canManageTeam(role) {

  return [
    'super_admin',
    'owner'
  ].includes(role)
}

export function canApprove(role) {

  return [
    'super_admin',
    'owner',
    'manager'
  ].includes(role)
}
export function canManageClients(role) {
  return (
    role === 'owner' ||
    role === 'manager'
  )
}