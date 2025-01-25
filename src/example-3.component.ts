import {
  Component,
  signal,
  resource,
} from '@angular/core';
import { Cat } from './cat.model';

@Component({
  selector: 'app-example-3',
  template: `
    <h2>Example 3, call an api within the stream part of the resource api</h2>
    <br/>
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
export class Example3Component {
  protected readonly resource = resource({
    stream: async () => {
      const wrappedResponse = signal<{
        value: Cat[];
    } | {
        error: unknown;
    }>({ value: []});
      try {
        
        const response = await fetch(
          'https://api.thecatapi.com/v1/images/search?limit=10',
        ).then((res) => res.json() as Promise<Cat[]>);
        wrappedResponse.set({ value: response });
      } catch (e) {
        console.error(e);
        wrappedResponse.set({ error: e });
      }

      return wrappedResponse;
    },
  });
}