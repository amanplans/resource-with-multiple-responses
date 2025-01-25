import {
  Component,
  signal,
  resource,
  inject,
} from '@angular/core';
import { Cat } from './cat.model';
import { interval, take } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-example-5',
  template: `
    <h2>Example 5, call an api within the stream part of the resource api</h2>
    <br/>
    <p>Repeating for 5 times, we are at {{catCounter()}}</p>
    @let cats = resource.value();
    @for (cat of cats; track cat.id) {
      <div style="display:inline-block;">
        <img src='{{cat.url}}'>
      </div>
    } @empty {
      <div>Loading cats...</div>
    }
  `,
  styles: `img {
    height: 125px;
    width: 125px;
  }`
})
export class Example5Component {
  httpClient = inject(HttpClient);

  constructor() {
    this.loadCats();
  }

  loadCats() {
    console.log('Load cats');
    interval(3000) // every second
      .pipe(take(5)) // repeat 5 times
      .subscribe(() => {
        console.log('interval');
        this.loadCatsCounter();
        this.fetchRemoteData();
      });
  }

  protected catCounter = signal(0);

  protected loadCatsCounter() { 
    this.catCounter.update((counter) => counter + 1);
  }

  private async fetchRemoteData() {
    // this.httpClient
    //   .get<Cat[]>('https://api.thecatapi.com/v1/images/search?limit=10');
    return await fetch(
      'https://api.thecatapi.com/v1/images/search?limit=10',
    ).then((res) => res.json() as Promise<Cat[]>);
  }
  
  protected readonly resource = resource({
    stream: async () => {
      const wrappedResponse = signal<{
        value: Cat[];
    } | {
        error: unknown;
    }>({ value: []});
      try {
        console.log('Start fetching cats');
        const response = await this.fetchRemoteData();
        wrappedResponse.set({ value: response });
      } catch (e) {
        console.error(e);
        wrappedResponse.set({ error: e });
      }

      return wrappedResponse;
    },
  });
}