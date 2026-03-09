
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private isDarkThemeSubject = new BehaviorSubject<boolean>(false);
    isDarkTheme$ = this.isDarkThemeSubject.asObservable();

    constructor() {
        const savedTheme = localStorage.getItem('theme');
        // Default to light if no preference saved
        const isDark = savedTheme ? savedTheme === 'dark' : false;
        this.setTheme(isDark);
    }

    toggleTheme() {
        this.setTheme(!this.isDarkThemeSubject.value);
    }

    private setTheme(isDark: boolean) {
        this.isDarkThemeSubject.next(isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        const html = document.documentElement;
        const body = document.body;
        if (isDark) {
            html.classList.add('dark-theme');
            html.classList.remove('light-theme');
            body.classList.add('dark-theme');
            body.classList.remove('light-theme');
        } else {
            html.classList.add('light-theme');
            html.classList.remove('dark-theme');
            body.classList.add('light-theme');
            body.classList.remove('dark-theme');
        }
    }

    get isDark(): boolean {
        return this.isDarkThemeSubject.value;
    }
}
