
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<any>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {
        const user = localStorage.getItem('currentUser');
        if (user) {
            this.currentUserSubject.next(JSON.parse(user));
        }
    }

    public get currentUserValue(): any {
        return this.currentUserSubject.value;
    }

    login(credentials: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/auth/login`, credentials).pipe(
            tap(user => {
                if (user && user.token) {
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.currentUserSubject.next(user);
                }
            })
        );
    }

    register(user: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/auth/register`, user);
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }

    getToken(): string | null {
        return this.currentUserValue?.token || null;
    }

    getRole(): string | null {
        const token = this.getToken();
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null;
        } catch (e) {
            return null;
        }
    }

    getFullName(): string | null {
        const token = this.getToken();
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.fullName || payload.FullName || payload.name || payload.unique_name || payload.given_name || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] || null;
        } catch (e) {
            return null;
        }
    }

    getEmail(): string | null {
        const token = this.getToken();
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || null;
        } catch (e) {
            return null;
        }
    }

    isAdmin(): boolean {
        return this.getRole() === 'Admin';
    }
}
