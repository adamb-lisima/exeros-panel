import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from 'src/app/service/http/http.service';

export interface TicketResponse {
  data: {
    id: number;
    subject: string;
    status: number;
    created_at: string;
    description: string;
    priority: number;
    attachments: string[];
  };
  meta: any;
}

export interface TicketListResponse {
  data: Array<{
    id: number;
    subject: string;
    status: number;
    created_at: string;
    description: string;
    priority: number;
    attachments: string[];
  }>;
  meta: {
    has_next_page: boolean;
    total: number;
  };
}

@Injectable({ providedIn: 'root' })
export class TicketService {
  constructor(private readonly httpService: HttpService) {}

  getTickets(page: number = 1, perPage: number = 10): Observable<TicketListResponse> {
    return this.httpService.get$<TicketListResponse>('v2/tickets', {
      page,
      per_page: perPage
    });
  }

  createTicket(formData: FormData): Observable<TicketResponse> {
    return this.httpService.post$<TicketResponse>('v2/tickets/create', formData);
  }
}
