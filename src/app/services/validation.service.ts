import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  private moviesUrl = 'https://switch-yam-equator.azurewebsites.net/api/validation';
  private headers = new HttpHeaders().set('x-chmura-cors', 'e8a89197-1340-4026-9826-b83c2065ca3a');
  constructor(private http: HttpClient) { }

  validateResults(data: any): Observable<any> {
    return this.http.post(this.moviesUrl, data,{ headers: this.headers });
  }
}
