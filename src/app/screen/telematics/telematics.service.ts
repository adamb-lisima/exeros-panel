import { Injectable } from '@angular/core';
import { HttpService } from 'src/app/service/http/http.service';

@Injectable({ providedIn: 'root' })
export class TelematicsService {
  constructor(private readonly httpService: HttpService) {}
}
