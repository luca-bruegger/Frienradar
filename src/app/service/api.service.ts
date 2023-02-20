import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  options = {
    observe: 'response' as 'body', // to display the full response & as 'body' for type cast
    responseType: 'json'
  } as Partial<any>;

  constructor(private http: HttpClient) { }

  get(path: string) {
    const url = environment.apiUrl + path;
    return this.http.get(url);
  }

  post(path: string, body: any) {
    const url = environment.apiUrl + path;
    return this.http.post(url, body, this.options);
  }

  put(path: string, body: any) {
    const url = environment.apiUrl + path;
    return this.http.put(url, body);
  }

  delete(path: string) {
    const url = environment.apiUrl + path;
    return this.http.delete(url);
  }
}
