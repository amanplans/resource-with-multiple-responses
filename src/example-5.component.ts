import { Component, signal, resource, inject } from "@angular/core";
import { rxResource } from "@angular/core/rxjs-interop";
import { Cat } from "./cat.model";
import { interval, Observable, take } from "rxjs";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-example-5",
  template: `
    <h2>Example 5, call an api within the stream part of the resource api</h2>
    <br />
    <p>Repeating for 5 times, we are at {{ catCounter() }}</p>
    @let cats = resource.value(); @for (cat of cats; track cat.id) {
    <div style="display:inline-block;">
      <img src="{{ cat.url }}" />
    </div>
    } @empty {
    <div>Loading cats...</div>
    }
  `,
  styles: `img {
    height: 125px;
    width: 125px;
  }`,
})
export class Example5Component {
  httpClient = inject(HttpClient);

  constructor() {
    this.loadCats();
  }

  private cats = signal<{
    value: Cat[];
  }>({ value: [] });
  private loadCats() {
    console.log("Load cats");
    interval(3000) // every second
      .pipe(take(5)) // repeat 5 times
      .subscribe(() => {
        console.log("interval");
        this.loadCatsCounter();
        // async () => {
        //   console.log('In async of loadCats');
        // const fetchedCats = await this.fetchRemoteData();
        // this.cats.set({ value: fetchedCats});
        // }
        this.fetchRemoteData2().subscribe((cats) => {
          // this.cats.set({ value: cats});
          this.cats.update((cats2) => { 
            return { value: [...cats2.value, ...cats] }
          });
        });
      });
  }

  protected catCounter = signal(0);
  protected loadCatsCounter() {
    this.catCounter.update((counter) => counter + 1);
  }

  private async fetchRemoteData() {
    console.log("Fetching cats from the api");
    // this.httpClient
    //   .get<Cat[]>('https://api.thecatapi.com/v1/images/search?limit=10');
    const cats = await fetch(
      "https://api.thecatapi.com/v1/images/search?limit=10"
    ).then((res) => res.json() as Promise<Cat[]>);
    return cats;
  }

  private fetchRemoteData2(): Observable<Cat[]> {
    console.log("Fetching cats 2 from the api");
    const cats$ = this.httpClient.get<Cat[]>(
      "https://api.thecatapi.com/v1/images/search?limit=10"
    );
    return cats$;
  }

  protected readonly resource = resource<Cat[], Cat[]>({
    // request: () => ({cats: this.cats()}),
    stream: async () => this.cats,
    // stream: async (request) => {
    //   const wrappedResponse = signal<{
    //     value: Cat[];
    // } | {
    //     error: unknown;
    // }>({ value: []});
    //   try {
    //     console.log('In the stream fetching cats');
    //     const response = await this.fetchRemoteData();
    //     wrappedResponse.set(this.cats());
    //   } catch (e) {
    //     console.error(e);
    //     wrappedResponse.set({ error: e });
    //   }

    //   return wrappedResponse;
    // },
  });

  // protected readonly rxResource = rxResource({
  //   request: () => ({}),
  //   stream: () => this.resource.value(),
  // });
}
