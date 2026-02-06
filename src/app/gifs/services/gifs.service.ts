import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import type { GiphyResponse } from '../interfaces/giphy.interfaces';
import { Gif } from '../interfaces/gif.interfaces';
import { GifMapper } from '../mapper/gif.mapper';
import { map, tap } from 'rxjs';

@Injectable({providedIn: 'root'})
export class GifService {

  private http = inject(HttpClient);

  constructor() {
    this.loadTrendingGifs();
  }

  trendingGifs = signal<Gif[]>([]);
  trendingGifsLoading = signal(true);

  searchHistory = signal<Record<string, Gif[]>>({});
  searchHistoryKeys = computed( () => Object.keys( this.searchHistory() ) );

  loadTrendingGifs() {
    this.http.get<GiphyResponse>(`${environment.giphyUrl}/gifs/trending`, {
      params: {
        api_key: environment.apiKeyGiphy,
        limit: 25,
        rating: 'G'
      }
    }).subscribe( (resp) => {
      const gifs = GifMapper.mapGiphyItemsToGifArray( resp.data );
      this.trendingGifs.set( gifs );
      console.log({ gifs });
    });
  }

  searchGifs( query: string ) {
    return this.http.get<GiphyResponse>(`${environment.giphyUrl}/gifs/search`, {
      params: {
        api_key: environment.apiKeyGiphy,
        q: query,
        limit: 25,
        rating: 'G'
      }
    }).pipe(
      map( ({data}) => data ),
      map( (items) => GifMapper.mapGiphyItemsToGifArray(items) ),

      tap( (items) => {
        this.searchHistory.update( (history) => ({
            ...history,
            [query.toLowerCase()]: items,
        }));
      })
    );


    /* .subscribe( (resp) => {
      const gifs = GifMapper.mapGiphyItemsToGifArray( resp.data );
      console.log({ gifs });
    }); */
  }

}
