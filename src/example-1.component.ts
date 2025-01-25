import {
  Component,
  signal,
  computed,
  Signal,
  WritableSignal,
  linkedSignal,
  ResourceRef,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { inject } from '@angular/core';
import { Todo } from './todo.model';

@Component({
  selector: 'app-example-1',
  template: `
    <h2>Example 1, resource api using loader and linkedSignal</h2>
    <div>Page: {{page()}}</div>
    <button (click)='nextPage()'>Load more</button>

    @for (todo of allTodos(); track todo.id) {
      <div> {{todo.id }} - {{todo.title}}
      </div>
    }
  `,
})
export class Example1Component {
  readonly #httpClient = inject(HttpClient);

  protected page: WritableSignal<number> = signal(1);
  protected nextPage(): void {
    this.page.update((page: number) => page + 1);
  }

  // Retrieve new todo's everytime the page gets incremented
  readonly #rxResource: ResourceRef<Todo[] | undefined> = rxResource({
    request: () => ({ page: this.page() }),
    loader: ({ request }) => {
      return this.#httpClient.get<Todo[]>(
        `https://jsonplaceholder.typicode.com/todos?_limit=10&_page=${request.page}`
      );
    },
  });

  // The 1st time when resource is calling the URL, we do not have todo's yet,
  // which is why value is undefined
  readonly #todosFromResource: Signal<Todo[] | undefined> = computed(() => {
    return this.#rxResource.value();
  });

  protected readonly allTodos: WritableSignal<Todo[]> = linkedSignal<
    Todo[] | undefined,
    Todo[]
  >({
    source: this.#todosFromResource,
    computation: (newTodos, previous) => {
      const currentTodos = previous?.value ?? [];
      // newTodos is undefined when the resource API is loading.
      // The first time return an empty array set in currentTodos,
      // then previous will be populated with an empty array.
      // When the resource API finish fetching the todo's,
      // newTodos will contain the todo's
      if (newTodos === undefined) {
        return currentTodos;
      }

      // Concat the existing todo's with the todo's from the incremented page.
      // The first time, there is no previous and no value
      return [...currentTodos, ...newTodos];
    },
  });
}