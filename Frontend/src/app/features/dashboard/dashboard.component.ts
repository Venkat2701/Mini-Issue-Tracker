import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IssueService, Issue } from '../../core/services/issue.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        RouterModule
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
    stats = {
        open: { count: 0, trend: 'flat', percent: 0 },
        inProgress: { count: 0, trend: 'flat', percent: 0 },
        closed: { count: 0, trend: 'flat', percent: 0 },
        total: 0
    };
    recentIssues: Issue[] = [];
    private authSubscription?: Subscription;
    isAdmin = false;

    constructor(
        private issueService: IssueService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef,
        private router: Router
    ) { }

    ngOnInit() {
        this.authSubscription = this.authService.currentUser$.subscribe(user => {
            if (user) {
                this.isAdmin = this.authService.isAdmin();
                this.loadIssues();
            }
        });
    }

    ngOnDestroy() {
        this.authSubscription?.unsubscribe();
    }

    loadIssues() {
        this.issueService.getAll().subscribe({
            next: (issues) => {
                if (issues) {
                    const sortedIssues = [...issues].sort((a, b) => {
                        const dateA = new Date(a.updatedDate || a.createdDate || 0).getTime();
                        const dateB = new Date(b.updatedDate || b.createdDate || 0).getTime();
                        return dateB - dateA;
                    });
                    this.recentIssues = sortedIssues.slice(0, 5);
                } else {
                    this.recentIssues = [];
                }
                this.calculateStats(issues || []);
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to load issues', err);
            }
        });
    }

    calculateStats(issues: Issue[]) {
        const now = new Date().getTime();
        const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

        let openToday = 0; let inProgToday = 0; let closedToday = 0;
        let openLastWeek = 0; let inProgLastWeek = 0; let closedLastWeek = 0;

        issues.forEach(issue => {
            const created = new Date(issue.createdDate || now).getTime();
            const updated = issue.updatedDate ? new Date(issue.updatedDate).getTime() : created;

            // Current state counts
            if (issue.status === 'Open') openToday++;
            if (issue.status === 'In Progress') inProgToday++;
            if (issue.status === 'Closed') closedToday++;

            // Previous week state heuristic
            if (created < oneWeekAgo) {
                if (updated < oneWeekAgo) {
                    // No changes in the last week, so state was same
                    if (issue.status === 'Open') openLastWeek++;
                    if (issue.status === 'In Progress') inProgLastWeek++;
                    if (issue.status === 'Closed') closedLastWeek++;
                } else {
                    // Modified in the last week. Estimate previous state.
                    if (issue.status === 'Closed') inProgLastWeek++;
                    else if (issue.status === 'In Progress') openLastWeek++;
                    else if (issue.status === 'Open') openLastWeek++;
                }
            }
        });

        const calcTrend = (today: number, lastWeek: number): any => {
            if (lastWeek === 0) return { trend: today > 0 ? 'up' : 'flat', percent: today > 0 ? 100 : 0 };
            const diff = today - lastWeek;
            const percent = Math.round(Math.abs(diff) / lastWeek * 100);
            return {
                trend: diff > 0 ? 'up' : (diff < 0 ? 'down' : 'flat'),
                percent: percent
            };
        };

        const openTrend = calcTrend(openToday, openLastWeek);
        const inProgTrend = calcTrend(inProgToday, inProgLastWeek);
        const closedTrend = calcTrend(closedToday, closedLastWeek);

        this.stats = {
            open: { count: openToday, trend: openTrend.trend, percent: openTrend.percent },
            inProgress: { count: inProgToday, trend: inProgTrend.trend, percent: inProgTrend.percent },
            closed: { count: closedToday, trend: closedTrend.trend, percent: closedTrend.percent },
            total: issues.length
        };
    }

    createNewIssue() {
        this.router.navigate(['/issues'], { queryParams: { action: 'new' } });
    }
}
