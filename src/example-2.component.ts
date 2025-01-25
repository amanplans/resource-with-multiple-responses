import {
  Component,
  signal,
  computed,
  ResourceRef,
  resource,
} from '@angular/core';

@Component({
  selector: 'app-example-2',
  template: `
    <h2>Example 2, support multiple responses in resource()</h2>
    <button type="button" mat-flat-button color="primary" (click)='increaseValue()'>Increase value</button><br/>
    Value: {{ value() }}
  `,
})
export class Example2Component {

  stream = signal<{value: number}>({value: 1});

  res: ResourceRef<number | undefined> = resource<number, number>({
      stream: async () => this.stream,
    });

  value = computed(() => this.res.value() ?? -1);

  protected increaseValue() {
    this.stream.set({value: this.value() + 1});
  }
}