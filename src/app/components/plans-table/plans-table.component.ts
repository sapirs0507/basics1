import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PeriodicElement } from 'src/app/interfaces/PeriodicElement.interface';

@Component({
  selector: 'app-plans-table',
  templateUrl: './plans-table.component.html',
  styleUrls: ['./plans-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlansTableComponent {
  @Input('data') dataSource?: PeriodicElement[] ;
  displayedColumns: string[] = [ 'name', 'dunam', 'status'];
}
