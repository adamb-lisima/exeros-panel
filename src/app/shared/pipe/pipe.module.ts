import { NgModule } from '@angular/core';
import { ContainsPropertyModule } from 'src/app/shared/pipe/contains-property/contains-property.module';
import { ContainsModule } from 'src/app/shared/pipe/contains/contains.module';
import { FilterModule } from 'src/app/shared/pipe/filter/filter.module';
import { FindModule } from 'src/app/shared/pipe/find/find.module';
import { FirstCharacterModule } from 'src/app/shared/pipe/first-character/first-character.module';
import { HumanizeModule } from 'src/app/shared/pipe/humanize/humanize.module';
import { TruncateModule } from 'src/app/shared/pipe/truncate/truncate.module';
import { DateFormatModule } from './date-format/date-format.module';
import { EveryModule } from './every/every.module';
import { HumanizeFileSizeModule } from './humanize-file-size/humanize-file-size.module';
import { IncludesModule } from './includes/includes.module';
import { JoinModule } from './join/join.module';
import { OrdinalNumberSuffixModule } from './ordinal-number-suffix/ordinal-number-suffix.module';
import { UnitConverterModule } from './unit-converter/unit-converter.module';

@NgModule({
  exports: [ContainsPropertyModule, ContainsModule, HumanizeModule, FindModule, FirstCharacterModule, FilterModule, TruncateModule, UnitConverterModule, OrdinalNumberSuffixModule, IncludesModule, JoinModule, HumanizeFileSizeModule, EveryModule, DateFormatModule]
})
export class PipeModule {}
