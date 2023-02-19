import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) { }

  get(path: string) {
    const url = environment.apiUrl + path;
    return this.http.get(url);
  }

  post(path: string, body: any) {
    const url = environment.apiUrl + path;
    return this.http.post(url, body);
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
