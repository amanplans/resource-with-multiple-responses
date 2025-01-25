import {
  Component,
  signal,
  Signal,
  VERSION
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { Example1Component } from './example-1.component';
import { Example2Component } from './example-2.component';
import { Example3Component } from './example-3.component';

@Component({
  selector: 'app-root',
  imports: [Example1Component, Example2Component, Example3Component],
  template: `
    <p>Version: {{version()}}</p>    
    <!-- <app-example-1></app-example-1> -->
    <app-example-2></app-example-2>
    <app-example-3></app-example-3>
  `,
})
export class App {
  protected version: Signal<string> = signal(VERSION.full);  
}

bootstrapApplication(App, {
  providers: [provideHttpClient()],
}).catch((err) => console.error(err));
