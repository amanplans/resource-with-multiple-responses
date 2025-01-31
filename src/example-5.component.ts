import { Component, signal, resource, inject } from "@angular/core";
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
  #httpClient = inject(HttpClient);

  constructor() {
    this.loadCats();
  }

  protected catCounter = signal(0);
  private loadCatsCounter(): void {
    this.catCounter.update((counter) => counter + 1);
  }

  private cats = signal<{
    value: Cat[];
  }>({ value: [] });
  private loadCats() {
    interval(3000) // every second
      .pipe(take(5)) // repeat 5 times
      .subscribe(() => {
        this.loadCatsCounter();
        this.fetchRemoteData2().subscribe((cats) => {
          this.cats.update((cats2) => { 
            return { value: [...cats2.value, ...cats] }
          });
        });
      });
  }

  private fetchRemoteData2(): Observable<Cat[]> {
    const cats$ = this.#httpClient.get<Cat[]>(
      "https://api.thecatapi.com/v1/images/search?limit=10"
    );
    return cats$;
  }

  protected readonly resource = resource<Cat[], Cat[]>({
    stream: async () => this.cats,
    defaultValue: [],
  });
}
