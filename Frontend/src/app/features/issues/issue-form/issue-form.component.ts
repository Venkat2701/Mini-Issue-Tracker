
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { IssueService, Issue } from '../../../core/services/issue.service';
import { UserService, User } from '../../../core/services/user.service';

@Component({
    selector: 'app-issue-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule
    ],
    templateUrl: './issue-form.component.html',
    styleUrl: './issue-form.component.css'
})
export class IssueFormComponent implements OnInit {
    issueForm: FormGroup;
    isEdit: boolean;

    users: User[] = [];

    constructor(
        private fb: FormBuilder,
        private issueService: IssueService,
        private userService: UserService,
        public dialogRef: MatDialogRef<IssueFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Issue
    ) {
        // Robust edit mode detection checking for multiple ID field variations
        this.isEdit = !!data.issueId;

        this.issueForm = this.fb.group({
            title: [data.title, [Validators.required]],
            description: [data.description || ''],
            status: [data.status || 'Open', [Validators.required]],
            priority: [data.priority || 'Medium', [Validators.required]],
            assigneeId: [data.assigneeId || null]
        });
    }

    ngOnInit() {
        this.userService.getAll().subscribe({
            next: (users) => this.users = users || []
        });
    }

    onSubmit() {
        if (this.issueForm.valid) {
            const finalId = this.data.issueId;
            if (this.isEdit && finalId) {
                this.issueService.update(finalId, this.issueForm.value).subscribe({
                    next: () => this.dialogRef.close(true)
                });
            } else {
                this.issueService.create(this.issueForm.value).subscribe({
                    next: () => this.dialogRef.close(true)
                });
            }
        }
    }

    onCancel() {
        this.dialogRef.close(false);
    }
}
