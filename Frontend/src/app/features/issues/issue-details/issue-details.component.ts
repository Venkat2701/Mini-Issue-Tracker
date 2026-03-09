import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Issue } from '../../../core/services/issue.service';

@Component({
    selector: 'app-issue-details',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './issue-details.component.html',
    styleUrl: './issue-details.component.css'
})
export class IssueDetailsComponent {
    constructor(
        public dialogRef: MatDialogRef<IssueDetailsComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Issue
    ) { }

    closeDialog(): void {
        this.dialogRef.close();
    }
}
