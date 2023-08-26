import { ValidationService } from "./services/validation.service";

export interface Actor {
  actorId: number;
  name: string;
}

export interface Movie {
  movieId: string;
  title: string;
  actors: Array<number>;
}

interface ValidationData {
  Name: string;
  KRMovies: string[];
  NCMovies: string[];
}

export const KEANU_REEVES = 'Keanu Reeves';
export const NICOLAS_CAGE = 'Nicolas Cage';

import { Component, OnInit } from '@angular/core';
import { ActorsService } from "./services/actors.service";
import { MoviesService } from "./services/movies.service";
import { map, Subject, switchMap, takeUntil, tap } from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'actors';

  actorsWithBoth: Actor[] = [];
  validationResults: any;

  private _destroy$ = new Subject();

  constructor(
    private actorsService: ActorsService,
    private moviesService: MoviesService,
    private validationService: ValidationService
  ) {
  }

  ngOnInit() {

    this.actorsService.getActors()
      .pipe(
        takeUntil(this._destroy$),
        tap((actorsData: Actor[]) => {
          const keanu = actorsData.find((actor: Actor) => actor.name === KEANU_REEVES);
          const nicolas = actorsData.find((actor: Actor) => actor.name === NICOLAS_CAGE);

          if (keanu && nicolas) {
            this.fetchMoviesWithBothActors(keanu.actorId, nicolas.actorId, actorsData);
          } else {
            console.error('Keanu Reeves or Nicolas Cage data not found.');
          }
        }),
      )
      .subscribe(() => {});
  }

  fetchMoviesWithBothActors(keanuId: number, nicolasId: number, actorsData: any): void {
    this.moviesService.getMovies()
      .pipe(
        map((moviesData) => {
          // Find movies with Keanu Reeves and Nicolas Cage separately
          const keanuMovies = moviesData.filter((movie: Movie) => movie.actors.includes(keanuId));
          const nicolasMovies = moviesData.filter((movie: Movie) => movie.actors.includes(nicolasId));

          // Extract actor IDs from the movies of Keanu Reeves and Nicolas Cage
          const keanuActorIds = new Set(keanuMovies.flatMap((movie: Movie) => movie.actors));
          const nicolasActorIds = new Set(nicolasMovies.flatMap((movie: Movie) => movie.actors));

          // Find actors who have been in movies with both Nicolas Cage and Keanu Reeves
          this.actorsWithBoth = Array.from(keanuActorIds)
            .filter(actorId => nicolasActorIds.has(actorId))
            .map(actorId => {
              return actorsData.find((actor: Actor) => actor.actorId === actorId);
            });

          return this.prepareValidationData(this.actorsWithBoth, keanuMovies, nicolasMovies);
        }),
        switchMap((validationData)=> this.validationService.validateResults(validationData)),
        takeUntil(this._destroy$)
      )
      .subscribe(
      (validationResults) => {
        this.validationResults = validationResults;
      }
    );
  }

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
    this._destroy$.next(true);
    this._destroy$.unsubscribe();
  }
}
