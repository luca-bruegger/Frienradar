import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly options = {
    observe: 'response' as 'body', // to display the full response & as 'body' for type cast
    responseType: 'json'
  } as Partial<any>;

  constructor(private http: HttpClient) { }

  get(path: string) {
    const url = environment.apiUrl + path;
    return this.http.get(url, {
      responseType: 'text'
    });
  }

  post(path: string, body: any, mulitpartHeader = false) {
    const options = this.options;

    if (mulitpartHeader) {
      const headers = new HttpHeaders();
      headers.append('Content-Type', 'multipart/form-data');
      options.headers = headers;
    }

    const url = environment.apiUrl + path;
    return this.http.post(url, body, options);
  }

  put(path: string, body: any, mulitpartHeader = false) {
    const options = this.options;

    if (mulitpartHeader) {
      const headers = new HttpHeaders();
      headers.append('Content-Type', 'multipart/form-data');
      options.headers = headers;
    }

    const url = environment.apiUrl + path;
    return this.http.put(url, body);
  }

  delete(path: string) {
    const url = environment.apiUrl + path;
    return this.http.delete(url);
  }
}
