import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { Actor } from "../app.component";

@Injectable({
  providedIn: 'root'
})
export class ActorsService {
  private actorsUrl = 'https://switch-yam-equator.azurewebsites.net/api/actors';
  private headers = new HttpHeaders().set('x-chmura-cors', 'e8a89197-1340-4026-9826-b83c2065ca3a');
  constructor(private http: HttpClient) { }

  getActors(): Observable<Actor[]> {
    return this.http.get<Actor[]>(this.actorsUrl, { headers: this.headers });
  }
}
