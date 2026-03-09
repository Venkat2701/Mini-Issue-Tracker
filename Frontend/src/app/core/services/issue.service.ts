
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Issue {
    issueId?: number;
    title: string;
    description?: string;
    status: string;
    priority: string;
    assigneeId?: number | null;
    assignee?: any;
    createdDate?: string | Date;
    updatedDate?: string | Date | null;
}

@Injectable({
    providedIn: 'root'
})
export class IssueService {
    private apiUrl = `${environment.apiUrl}/issues`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Issue[]> {
        return this.http.get<Issue[]>(this.apiUrl);
    }

    getById(id: number): Observable<Issue> {
        return this.http.get<Issue>(`${this.apiUrl}/${id}`);
    }

    create(issue: Issue): Observable<Issue> {
        return this.http.post<Issue>(this.apiUrl, issue);
    }

    update(id: number, issue: Issue): Observable<Issue> {
        return this.http.put<Issue>(`${this.apiUrl}/${id}`, issue);
    }

    delete(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
