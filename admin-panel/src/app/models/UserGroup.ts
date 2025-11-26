export interface UserGroup{
  userId?: string;
  groupName: string;
  members?: UserGroupMember[];

}

export interface UserGroupMember{
  userGroupId: string;
  userId: string;
  username: string;
  name: string;
}
