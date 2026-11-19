import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DailyLogComponent } from './pages/daily-log/daily-log.component';
import { HistoryComponent } from './pages/history/history.component';
import { ReportsComponent } from './pages/reports/reports.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'daily-log', component: DailyLogComponent },
  { path: 'daily-log/:date', component: DailyLogComponent },
  { path: 'history', component: HistoryComponent },
  { path: 'reports', component: ReportsComponent },
  { path: '**', redirectTo: '' },
];
