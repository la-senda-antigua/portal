import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Sermon } from '../models/Sermon';

@Injectable({
  providedIn: 'root'
})
export class SermonsService {
  private apiUrl = 'assets/sermons.json';

  constructor(private http: HttpClient) { }

  getSermons() {
    return this.http.get<Sermon[]>('assets/sermons.json'); // <-- ¡Tipado como array!  }

}
