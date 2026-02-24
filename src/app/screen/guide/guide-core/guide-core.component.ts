import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectIsLoading } from '../guide.selectors';

@Component({
  selector: 'app-guide-core',
  templateUrl: './guide-core.component.html'
})
export class GuideCoreComponent implements OnInit {
  isLoading$!: Observable<boolean>;

  constructor(private readonly store: Store) {}

  ngOnInit(): void {
    this.isLoading$ = this.store.select(selectIsLoading);
  }
}
