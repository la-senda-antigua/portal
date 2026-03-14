export interface UserGroup{
  id?: string;
  groupName: string;
  members?: UserGroupMember[];

}

export interface UserGroupDto {
  id?: string;
  groupName: string;
  members?: string[];
}

export interface UserGroupMember{
  userGroupId: string;
  userId: string;
  username: string;
  name: string;
  lastName: string;
}
