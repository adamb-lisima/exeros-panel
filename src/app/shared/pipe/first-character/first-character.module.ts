import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FirstCharacterPipe } from 'src/app/shared/pipe/first-character/first-character.pipe';

@NgModule({
  declarations: [FirstCharacterPipe],
  imports: [CommonModule],
  exports: [FirstCharacterPipe]
})
export class FirstCharacterModule {}
