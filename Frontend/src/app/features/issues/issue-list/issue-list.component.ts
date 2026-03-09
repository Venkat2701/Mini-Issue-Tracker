import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IssueService, Issue } from '../../../core/services/issue.service';
import { IssueFormComponent } from '../issue-form/issue-form.component';
import { IssueDetailsComponent } from '../issue-details/issue-details.component';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-issue-list',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatSnackBarModule,
        MatTooltipModule
    ],
    templateUrl: './issue-list.component.html',
    styleUrl: './issue-list.component.css'
})
export class IssueListComponent implements OnInit, OnDestroy {
    displayedColumns: string[] = ['issueId', 'title', 'assignee', 'priority', 'status', 'actions'];
    dataSource: MatTableDataSource<Issue> = new MatTableDataSource<Issue>([]);
    private authSubscription?: Subscription;
    isAdmin = false;
    currentUserEmail: string | null = null;

    filterValues = {
        title: '',
        status: '',
        priority: ''
    };

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private issueService: IssueService,
        private authService: AuthService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute,
        private router: Router
    ) {
        // Initialize with custom filter predicate
        this.dataSource.filterPredicate = this.createFilter();
    }

    ngOnInit() {
        this.authSubscription = this.authService.currentUser$.subscribe(user => {
            if (user) {
                this.isAdmin = this.authService.isAdmin();
                this.currentUserEmail = this.authService.getEmail() || user.email;
                if (!this.isAdmin) {
                    this.displayedColumns = ['issueId', 'title', 'assignee', 'priority', 'status'];
                } else {
                    this.displayedColumns = ['issueId', 'title', 'assignee', 'priority', 'status', 'actions'];
                }
                this.loadIssues();
            }
        });

        this.route.queryParams.subscribe(params => {
            if (params['action'] === 'new') {
                // Clear the query parameter
                this.router.navigate([], {
                    relativeTo: this.route,
                    queryParams: { action: null },
                    queryParamsHandling: 'merge',
                    replaceUrl: true
                });

                // Add a small delay for smooth transition animation after route navigation
                setTimeout(() => {
                    this.openIssueForm();
                }, 100);
            }
        });
    }

    ngOnDestroy() {
        this.authSubscription?.unsubscribe();
    }

    createFilter(): (data: Issue, filter: string) => boolean {
        return (data: Issue, filter: string): boolean => {
            try {
                const searchTerms = JSON.parse(filter);
                const titleMatch = data.title.toLowerCase().indexOf(searchTerms.title.toLowerCase()) !== -1;
                const statusMatch = !searchTerms.status || data.status.toLowerCase() === searchTerms.status.toLowerCase();
                const priorityMatch = !searchTerms.priority || data.priority.toLowerCase() === searchTerms.priority.toLowerCase();
                return titleMatch && statusMatch && priorityMatch;
            } catch (e) {
                return true;
            }
        };
    }

    loadIssues() {
        this.issueService.getAll().subscribe({
            next: (issues) => {
                this.dataSource.data = issues || [];
                // Re-assign paginator and sort after data load
                setTimeout(() => {
                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                });
                this.applyFilterValues();
                this.cdr.detectChanges();
            }
        });
    }

    applyFilterValues() {
        this.dataSource.filter = JSON.stringify(this.filterValues);
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.filterValues.title = filterValue.trim().toLowerCase();
        this.applyFilterValues();
    }

    filterByStatus(status: string) {
        this.filterValues.status = status;
        this.applyFilterValues();
    }

    filterByPriority(priority: string) {
        this.filterValues.priority = priority;
        this.applyFilterValues();
    }

    openIssueForm(issue?: Issue) {
        const dialogRef = this.dialog.open(IssueFormComponent, {
            width: '500px',
            enterAnimationDuration: '400ms',
            exitAnimationDuration: '300ms',
            data: issue || { title: '', description: '', status: 'Open', priority: 'Medium' }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadIssues();
            }
        });
    }

    updateStatus(issue: Issue, newStatus: string) {
        const updatedIssue = { ...issue, status: newStatus };
        const finalId = issue.issueId!;
        this.issueService.update(finalId, updatedIssue).subscribe({
            next: () => {
                this.loadIssues();
                this.snackBar.open('Status updated successfully', 'Close', { duration: 3000 });
            },
            error: () => {
                this.snackBar.open('Failed to update status', 'Close', { duration: 3000 });
            }
        });
    }

    deleteIssue(id: number) {
        if (confirm('Are you sure you want to delete this issue?')) {
            this.issueService.delete(id).subscribe({
                next: () => {
                    this.loadIssues();
                    this.snackBar.open('Issue deleted', 'Close', { duration: 3000 });
                },
                error: () => {
                    this.snackBar.open('Failed to delete issue', 'Close', { duration: 3000 });
                }
            });
        }
    }

    canEditStatus(issue: Issue): boolean {
        if (this.isAdmin) return true;
        if (!issue.assignee || !this.currentUserEmail) return false;
        return issue.assignee.email?.toLowerCase() === this.currentUserEmail.toLowerCase();
    }

    viewIssueDetails(issue: Issue) {
        this.dialog.open(IssueDetailsComponent, {
            width: '600px',
            enterAnimationDuration: '400ms',
            exitAnimationDuration: '300ms',
            data: issue
        });
    }
}
