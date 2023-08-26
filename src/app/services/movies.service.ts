import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { Movie } from "../app.component";

@Injectable({
  providedIn: 'root'
})
export class MoviesService {
  private moviesUrl = 'https://switch-yam-equator.azurewebsites.net/api/movies';
  private headers = new HttpHeaders().set('x-chmura-cors', 'e8a89197-1340-4026-9826-b83c2065ca3a');
  constructor(private http: HttpClient) { }

  getMovies(): Observable<Movie[]> {
    return this.http.get<Movie[]>(this.moviesUrl, { headers: this.headers });
  }
}
