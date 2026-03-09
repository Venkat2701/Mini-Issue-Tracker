
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { UserService } from '../services/user.service';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatTooltipModule
    ],
    templateUrl: './layout.component.html',
    styleUrl: './layout.component.css'
})
export class LayoutComponent {
    currentUser: any;
    userRole: string | null = null;
    userName: string | null = null;

    constructor(
        private authService: AuthService,
        private router: Router,
        public themeService: ThemeService,
        private userService: UserService
    ) {
        this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
            this.userRole = this.authService.getRole();
            let nameFromToken = this.authService.getFullName() || user?.fullName;

            if (nameFromToken) {
                this.userName = nameFromToken;
            } else {
                this.userName = 'User'; // default until fetched
                const email = this.authService.getEmail() || user?.email;
                if (email) {
                    this.userService.getAll().subscribe(users => {
                        const matchedUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
                        if (matchedUser && matchedUser.fullName) {
                            this.userName = matchedUser.fullName;
                        }
                    });
                }
            }
        });
    }

    toggleTheme() {
        this.themeService.toggleTheme();
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
