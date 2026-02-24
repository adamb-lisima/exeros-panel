import { Injectable } from '@angular/core';
import { LuxonDateAdapter } from '@angular/material-luxon-adapter';

@Injectable()
export class CustomDateAdapter extends LuxonDateAdapter {
  getFirstDayOfWeek(): number {
    return 1;
  }
  getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
    const shortNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const narrowNames = shortNames; //['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const longNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    switch (style) {
      case 'long':
        return longNames;
      case 'short':
        return shortNames;
      case 'narrow':
        return narrowNames;
      default:
        return shortNames;
    }
  }
}
