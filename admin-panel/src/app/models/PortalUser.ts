export interface PortalUser{
  userId: string,
  username: string,
  name?: string,
  lastName?: string,
  role: string,
  calendarsAsManager?: any[],
  calendarsAsMember?: any[]
}
