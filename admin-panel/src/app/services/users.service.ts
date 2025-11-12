import { Observable } from 'rxjs';
import { GeneralServiceBase } from './general.service.base';
import { Injectable } from '@angular/core';

import { TableResult } from '../models/TableResult';
import { PortalUser } from '../models/PortalUser';

@Injectable({
  providedIn: 'root',
})
export class UsersService extends GeneralServiceBase {
  override apiUrl = '/users';

  override getPage(
    page: number = 1,
    pageSize: number = 10
  ): Observable<TableResult<PortalUser>> {
    const url: string = `${this.apiUrl}?page=${page}&pageSize=${pageSize}`;
    return this.requestManager.get<TableResult<PortalUser>>(url);
  }

  override add(item: PortalUser): Observable<PortalUser> {
    return this.requestManager.post<PortalUser>(this.apiUrl, item);
  }

  override edit(item: PortalUser): Observable<PortalUser> {
    const url = `${this.apiUrl}/${item.userId}`;
    return this.requestManager.put<PortalUser>(url, item);
  }

  override delete(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.requestManager.delete<void>(url);
  }

  override search(
    searchTerm: string,
    page: number = 1,
    pageSize: number = 10
  ): Observable<TableResult<PortalUser>> {
    const url: string = `${
      this.apiUrl
    }?page=${page}&pageSize=${pageSize}&searchTerm=${encodeURIComponent(
      searchTerm
    )}`;
    return this.requestManager.get<TableResult<PortalUser>>(url);
  }
}
