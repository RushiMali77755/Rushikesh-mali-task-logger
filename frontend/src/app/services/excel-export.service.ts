import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import {
  DailyReport,
  WeeklyReport,
  MonthlyReport,
  CategoryReport,
  ProjectReport,
} from '../models/report.model';

@Injectable({
  providedIn: 'root',
})
export class ExcelExportService {
  /**
   * Save worksheet array to excel file
   */
  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Export Daily Work Report
   */
  exportDailyReport(report: DailyReport, filename?: string): void {
    const logInfo = [
      ['Daily Work Report', ''],
      ['Date', report.log.logDate],
      ['Login Time', report.log.loginTime || '-'],
      ['Logout Time', report.log.logoutTime || '-'],
      ['Total Working Hours', report.log.totalWorkingHours ?? '-'],
      ['Total Task Hours', report.totalTaskHours],
      ['Total Tasks', report.taskCount],
      ['Completed Tasks', report.completedCount],
      ['Day Comment', report.log.dayComment || '-'],
      [],
    ];

    const taskHeaders = [
      ['#', 'Description', 'Category', 'Status', 'Start Time', 'End Time', 'Duration (hrs)', 'Tags'],
    ];

    const taskRows = report.tasks.map((t, idx) => [
      idx + 1,
      t.description,
      t.category,
      t.status,
      t.startTime || '-',
      t.endTime || '-',
      t.durationHours ?? '-',
      t.tags ? t.tags.join(', ') : '-',
    ]);

    const categoryHeaders = [[], ['Category Breakdown', 'Count', 'Hours']];
    const categoryRows = Object.entries(report.categoryBreakdown).map(([cat, val]) => [
      cat,
      val.count,
      val.hours,
    ]);

    const allData = [...logInfo, ...taskHeaders, ...taskRows, ...categoryHeaders, ...categoryRows];
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(allData);

    // Set column widths
    ws['!cols'] = [
      { wch: 6 },
      { wch: 35 },
      { wch: 20 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 16 },
      { wch: 25 },
    ];

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Daily Report');
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, filename || `Daily_Report_${report.log.logDate}`);
  }

  /**
   * Export Weekly Work Report
   */
  exportWeeklyReport(report: WeeklyReport, filename?: string): void {
    const summary = [
      ['Weekly Work Report', ''],
      ['Week Period', `${report.weekStart} to ${report.weekEnd}`],
      ['Working Days', report.workingDays],
      ['Total Working Hours', report.totalWorkingHours],
      ['Average Daily Hours', report.avgDailyHours],
      [],
      ['Date', 'Login', 'Logout', 'Work Hours', 'Task Hours', 'Tasks Count', 'Completed Tasks'],
    ];

    const rows = report.dailySummaries.map((s) => [
      s.date,
      s.loginTime || '-',
      s.logoutTime || '-',
      s.totalWorkingHours ?? '-',
      s.totalTaskHours,
      s.taskCount,
      s.completedCount,
    ]);

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([...summary, ...rows]);
    ws['!cols'] = [
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 16 },
    ];

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Weekly Report');
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, filename || `Weekly_Report_${report.weekStart}`);
  }

  /**
   * Export Monthly Work Report
   */
  exportMonthlyReport(report: MonthlyReport, filename?: string): void {
    const summary = [
      ['Monthly Work Report', ''],
      ['Month/Year', `${report.month}/${report.year}`],
      ['Period', `${report.monthStart} to ${report.monthEnd}`],
      ['Working Days', report.workingDays],
      ['Total Working Hours', report.totalWorkingHours],
      ['Average Daily Hours', report.avgDailyHours],
      [],
      ['Date', 'Login', 'Logout', 'Work Hours', 'Task Hours', 'Tasks Count', 'Completed Tasks'],
    ];

    const rows = report.dailySummaries.map((s) => [
      s.date,
      s.loginTime || '-',
      s.logoutTime || '-',
      s.totalWorkingHours ?? '-',
      s.totalTaskHours,
      s.taskCount,
      s.completedCount,
    ]);

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([...summary, ...rows]);
    ws['!cols'] = [
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 16 },
    ];

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Monthly Report');
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, filename || `Monthly_Report_${report.year}_${report.month}`);
  }

  /**
   * Export Category-wise Report
   */
  exportCategoryReport(report: CategoryReport, filename?: string): void {
    const summary = [
      ['Category-wise Work Report', ''],
      ['Date Range', `${report.from} to ${report.to}`],
      ['Total Hours', report.totalHours],
      [],
      ['Category', 'Time Spent (Hours)', 'Percentage (%)'],
    ];

    const rows = report.categories.map((c) => [c.category, c.hours, `${c.percentage}%`]);

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([...summary, ...rows]);
    ws['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 16 }];

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Category Report');
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, filename || `Category_Report_${report.from}_to_${report.to}`);
  }

  /**
   * Export Project/Tag-wise Report
   */
  exportProjectReport(report: ProjectReport, filename?: string): void {
    const summary = [
      ['Project/Tag-wise Work Report', ''],
      ['Date Range', `${report.from} to ${report.to}`],
      ['Total Hours', report.totalHours],
      [],
      ['Project / Tag', 'Time Spent (Hours)', 'Percentage (%)'],
    ];

    const rows = report.tags.map((t) => [t.tag, t.hours, `${t.percentage}%`]);

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([...summary, ...rows]);
    ws['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 16 }];

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Project Report');
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, filename || `Project_Report_${report.from}_to_${report.to}`);
  }
}
