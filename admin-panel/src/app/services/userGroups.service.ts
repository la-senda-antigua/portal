import { Observable } from 'rxjs';
import { GeneralServiceBase } from './general.service.base';
import { Injectable } from '@angular/core';
import { UserGroup } from '../models/UserGroup';

@Injectable({
  providedIn: 'root',
})
export class UserGroupsService extends GeneralServiceBase {
  override apiUrl = '/userGroups';

  override getAll(): Observable<UserGroup[]> {
    const url = `${this.apiUrl}/getAll`;
    return this.requestManager.get<UserGroup[]>(url);
  }

    override add(item: UserGroup): Observable<UserGroup> {
      return this.requestManager.post<UserGroup>(this.apiUrl, item);
    }

    override edit(item: UserGroup): Observable<UserGroup> {
      const url = `${this.apiUrl}/${item.id}`;
      return this.requestManager.put<UserGroup>(url, item);
    }
    editMembers(item: UserGroup): Observable<UserGroup> {
      const url = `${this.apiUrl}/editMembers/${item.id}`;
      return this.requestManager.put<UserGroup>(url, item);
    }

    override delete(id: number): Observable<void> {
      const url = `${this.apiUrl}/${id}`;
      return this.requestManager.delete<void>(url);
    }

    removeMember(userId: string, userGroupId: string): Observable<void> {
      const url = `${this.apiUrl}/removeMember/${userGroupId}/${userId}`;
      return this.requestManager.delete<void>(url);
    }
}
