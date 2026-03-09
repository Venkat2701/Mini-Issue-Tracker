import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { User, UserService } from '../../../core/services/user.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
    selector: 'app-user-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule
    ],
    templateUrl: './user-form.component.html',
    styleUrl: './user-form.component.css'
})
export class UserFormComponent implements OnInit {
    userForm: FormGroup;
    isEdit = false;
    saving = false;

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<UserFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: User | null
    ) {
        this.isEdit = !!data;
        this.userForm = this.fb.group({
            fullName: [data?.fullName || '', [Validators.required]],
            email: [data?.email || '', [Validators.required, Validators.email]],
            password: ['', this.isEdit ? [] : [Validators.required, Validators.minLength(6)]],
            role: [data?.role || 'User', [Validators.required]],
            status: [data?.status || 'Active']
        });
    }

    ngOnInit(): void { }

    onSubmit() {
        if (this.userForm.valid) {
            this.saving = true;
            const userData = this.userForm.value;

            if (this.isEdit && this.data?.userId) {
                // Remove password if not provided during edit
                if (!userData.password) {
                    delete userData.password;
                }
                this.userService.update(this.data.userId, userData).subscribe({
                    next: () => {
                        this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
                        this.dialogRef.close(true);
                    },
                    error: () => {
                        this.snackBar.open('Failed to update user', 'Close', { duration: 3000 });
                        this.saving = false;
                    }
                });
            } else {
                this.userService.create(userData).subscribe({
                    next: () => {
                        this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
                        this.dialogRef.close(true);
                    },
                    error: () => {
                        this.snackBar.open('Failed to create user', 'Close', { duration: 3000 });
                        this.saving = false;
                    }
                });
            }
        }
    }

    close() {
        this.dialogRef.close();
    }
}
