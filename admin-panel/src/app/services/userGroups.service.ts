import { Observable } from 'rxjs';
import { GeneralServiceBase } from './general.service.base';
import { Injectable } from '@angular/core';
import { UserGroupDto } from '../models/UserGroup';

@Injectable({
  providedIn: 'root',
})
export class UserGroupsService extends GeneralServiceBase {
  override apiUrl = '/userGroups';

  override getAll(): Observable<UserGroupDto[]> {
    const url = `${this.apiUrl}/getAll`;
    return this.requestManager.get<UserGroupDto[]>(url);
  }

    override add(item: UserGroupDto): Observable<UserGroupDto> {
      return this.requestManager.post<UserGroupDto>(this.apiUrl, item);
    }

    override edit(item: UserGroupDto): Observable<UserGroupDto> {
      const url = `${this.apiUrl}/${item.id}`;
      return this.requestManager.put<UserGroupDto>(url, item);
    }
    editMembers(item: UserGroupDto): Observable<UserGroupDto> {
      const url = `${this.apiUrl}/editMembers/${item.id}`;
      return this.requestManager.put<UserGroupDto>(url, item);
    }

    override delete(id: string): Observable<void> {
      const url = `${this.apiUrl}/${id}`;
      return this.requestManager.delete<void>(url);
    }

    removeMember(userId: string, userGroupId: string): Observable<void> {
      const url = `${this.apiUrl}/removeMember/${userGroupId}/${userId}`;
      return this.requestManager.delete<void>(url);
    }
}
