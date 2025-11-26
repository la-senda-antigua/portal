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
}
