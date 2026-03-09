
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserService, User } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserFormComponent } from '../user-form/user-form.component';

@Component({
    selector: 'app-user-list',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatTabsModule,
        MatSnackBarModule,
        MatDialogModule
    ],
    templateUrl: './user-list.component.html',
    styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
    displayedColumns: string[] = ['name', 'email', 'role', 'status', 'actions'];
    activeUsers: User[] = [];
    pendingUsers: User[] = [];

    isAdmin: boolean = false;

    constructor(
        private userService: UserService,
        private authService: AuthService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.isAdmin = this.authService.isAdmin();
        this.loadUsers();
    }

    loadUsers() {
        this.userService.getAll().subscribe({
            next: (users) => {
                if (!users) return;
                // Filter out System Admin
                const filteredUsers = users.filter(u => u.email !== 'admin@minitracker.com');
                this.activeUsers = filteredUsers.filter(u => u.status === 'Active');
                this.pendingUsers = filteredUsers.filter(u => u.status === 'Pending');
            },
            error: () => {
                this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
            }
        });
    }

    approveUser(id: number) {
        this.userService.updateStatus(id, 'Active').subscribe({
            next: () => {
                this.snackBar.open('User approved', 'Close', { duration: 3000 });
                this.loadUsers();
            },
            error: () => this.snackBar.open('Failed to approve', 'Close', { duration: 3000 })
        });
    }

    rejectUser(id: number) {
        if (confirm('Are you sure you want to reject this request?')) {
            this.userService.delete(id).subscribe({
                next: () => {
                    this.snackBar.open('User rejected', 'Close', { duration: 3000 });
                    this.loadUsers();
                },
                error: () => this.snackBar.open('Failed to reject', 'Close', { duration: 3000 })
            });
        }
    }

    openUserForm(user?: User) {
        const dialogRef = this.dialog.open(UserFormComponent, {
            width: '600px',
            data: user || null,
            disableClose: true
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadUsers();
            }
        });
    }

    deleteUser(id: number) {
        if (confirm('Are you sure you want to permanently delete this user?')) {
            this.userService.delete(id).subscribe({
                next: () => {
                    this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
                    this.loadUsers();
                },
                error: () => this.snackBar.open('Failed to delete user', 'Close', { duration: 3000 })
            });
        }
    }
}
