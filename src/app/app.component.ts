import { ValidationService } from "./services/validation.service";

// Interfaces for Actor and Movie
export interface Actor {
  actorId: number;
  name: string;
}

export interface Movie {
  movieId: string;
  title: string;
  actors: Array<number>;
}

// Interface for validation data
interface ValidationData {
  Name: string;
  KRMovies: string[];
  NCMovies: string[];
}

// Constants for actor names
export const KEANU_REEVES = 'Keanu Reeves';
export const NICOLAS_CAGE = 'Nicolas Cage';

import { Component, OnInit } from '@angular/core';
import { ActorsService } from "./services/actors.service";
import { MoviesService } from "./services/movies.service";
import { combineLatest, map, Observable, Subject, switchMap, takeUntil, tap } from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'actors';

  actorsWithBoth: Actor[] = []; // Array to store actors with both Nicolas Cage and Keanu Reeves
  validationResults: any; // Variable to store validation results

  private _destroy$ = new Subject(); // Subject to manage subscription cleanup

  constructor(
    private actorsService: ActorsService,
    private moviesService: MoviesService,
    private validationService: ValidationService
  ) {
  }

  ngOnInit() {
    this.fetchAndProcessData(); // Initiate data fetching and processing
  }

  fetchAndProcessData() {
    // Combine actors and movies observables and handle data processing
    combineLatest([
      this.actorsService.getActors(),
      this.moviesService.getMovies()
    ])
      .pipe(
        takeUntil(this._destroy$), // Unsubscribe when component is destroyed
        switchMap(([actorsData, moviesData]) => {
          const keanu = this.findActorByName(actorsData, KEANU_REEVES);
          const nicolas = this.findActorByName(actorsData, NICOLAS_CAGE);

          if (!keanu || !nicolas) {
            console.error('Keanu Reeves or Nicolas Cage data not found.');
            return [];
          }

          // Find movies with Keanu Reeves and Nicolas Cage separately
          const keanuMovies = this.getMoviesWithActor(moviesData, keanu.actorId);
          const nicolasMovies = this.getMoviesWithActor(moviesData, nicolas.actorId);

          // Find actors who have been in movies with both Nicolas Cage and Keanu Reeves
          this.actorsWithBoth = this.findActorsWithBoth(keanuMovies, nicolasMovies, actorsData);

          // Prepare validation data
          const validationData = this.prepareValidationData(this.actorsWithBoth, keanuMovies, nicolasMovies);

          // Validate results and set validationResults variable
          return this.validateAndSetResults(validationData);
        })
      )
      .subscribe(); // Subscribe to the combined observable
  }

  // Method to find actor by name
  findActorByName(actorsData: Actor[], name: string): Actor | undefined {
    return actorsData.find((actor: Actor) => actor.name === name);
  }

  // Method to get movies with a specific actor
  getMoviesWithActor(moviesData: Movie[], actorId: number): Movie[] {
    return moviesData.filter((movie: Movie) => movie.actors.includes(actorId));
  }

  // Method to get movies with a specific actor
  findActorsWithBoth(keanuMovies: Movie[], nicolasMovies: Movie[], actorsData: Actor[]): Actor[] {

    // Extract actor IDs from the movies of Keanu Reeves and Nicolas Cage
    const keanuActorIds = new Set(keanuMovies.flatMap((movie: Movie) => movie.actors));
    const nicolasActorIds = new Set(nicolasMovies.flatMap((movie: Movie) => movie.actors));

    // Find actors who have been in movies with both Nicolas Cage and Keanu Reeves
    return Array.from(keanuActorIds)
      .filter(actorId => nicolasActorIds.has(actorId))
      .map(actorId => {
        return actorsData.find((actor: Actor) => actor.actorId === actorId);
      })
      .filter((actor: Actor | undefined): actor is Actor => actor !== undefined); // Filter out undefined actors
  }

  // Method to validate results and set validationResults variable
  validateAndSetResults(validationData: ValidationData[]): Observable<any> {
    return this.validationService.validateResults(validationData)
      .pipe(
        tap((validationResults) => {
          this.validationResults = validationResults;
        })
      );
  }

  // Method to prepare validation data
  prepareValidationData(actorsWithBoth: Actor[], keanuMovies: Movie[], nicolasMovies: Movie[]): ValidationData[] {
    return actorsWithBoth.map(actor => {
      const actorId = actor.actorId;
      const getMoviesWithTitle = (movies: Movie[]) =>
        movies.filter((movie: Movie) => movie.actors.includes(actorId)).map((movie: Movie) => movie.title);

      return {
        Name: actor.name,
        KRMovies: getMoviesWithTitle(keanuMovies),
        NCMovies: getMoviesWithTitle(nicolasMovies)
      };
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next(true); // Signal subject to complete and unsubscribe
    this._destroy$.unsubscribe(); // Unsubscribe from observables
  }
}
