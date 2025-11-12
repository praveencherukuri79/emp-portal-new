import { Response } from 'express';
import PDFDocument from 'pdfkit';
import dayjs from 'dayjs';

export interface TimesheetPDFData {
  summary: {
    totalHours: number;
    billableHours: number;
    nonBillableHours: number;
    totalEntries: number;
  };
  entries: Array<{
    _id: string;
    userId: string;
    date: Date | string;
    project: string;
    task?: string;
    description?: string;
    hours: number;
    hoursWorked?: number;
    isBillable: boolean;
    status: string;
  }>;
  dateRange: {
    startDate?: string;
    endDate?: string;
  };
}

export interface LeavePDFData {
  summary: {
    totalLeaves: number;
    totalDays: number;
    approved: number;
    pending: number;
    rejected: number;
    byType: Record<string, { count: number; totalDays: number }>;
  };
  leaves: Array<{
    _id: string;
    userId: string | { firstName: string; lastName: string; email: string; employeeId?: string };
    leaveType: string;
    startDate: Date | string;
    endDate: Date | string;
    totalDays: number;
    status: string;
    reason?: string;
  }>;
  dateRange: {
    startDate?: string;
    endDate?: string;
  };
}

export interface TeamPDFData {
  teamSize: number;
  teamMembers: Array<{
    user: {
      id: string;
      name: string;
      email: string;
      employeeId?: string;
      role: string;
    };
    timesheetSummary: {
      totalHours: number;
      billableHours: number;
      entriesCount: number;
    };
    leaveSummary: {
      totalLeaves: number;
      totalDays: number;
      pending: number;
    };
  }>;
}

// Helper function to draw a table row
function drawTableRow(
  doc: InstanceType<typeof PDFDocument>,
  y: number,
  columns: Array<{ text: string; width: number; align?: 'left' | 'center' | 'right' }>,
  isHeader: boolean = false
): number {
  const rowHeight = isHeader ? 25 : 20;
  const startX = 50;
  let currentX = startX;

  // Draw background for header
  if (isHeader) {
    doc.rect(startX, y, 500, rowHeight).fill('#2c3e50');
  }

  columns.forEach((col, index) => {
    doc.fontSize(isHeader ? 10 : 9);
    doc.fillColor(isHeader ? '#ffffff' : '#000000');
    doc.text(col.text, currentX, y + (isHeader ? 8 : 6), {
      width: col.width,
      align: col.align || 'left'
    });
    currentX += col.width;
  });

  // Draw border
  doc.strokeColor('#e0e0e0').lineWidth(0.5);
  doc.moveTo(startX, y + rowHeight).lineTo(startX + 500, y + rowHeight).stroke();

  return y + rowHeight;
}

// Helper function to draw summary boxes
function drawSummaryBox(
  doc: InstanceType<typeof PDFDocument>,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  value: string,
  color: string = '#3498db'
): void {
  // Box background
  doc.rect(x, y, width, height).fill(color);
  
  // Label
  doc.fontSize(9).fillColor('#ffffff');
  doc.text(label, x + 10, y + 10, { width: width - 20, align: 'center' });
  
  // Value
  doc.fontSize(16).fillColor('#ffffff');
  doc.text(value, x + 10, y + 25, { width: width - 20, align: 'center' });
}

/**
 * Generate PDF to buffer, then send to response
 */
function generatePDFToBuffer(
  generateContent: (doc: InstanceType<typeof PDFDocument>) => void
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4'
    });

    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    doc.on('end', () => {
      const buffer = Buffer.concat(chunks);
      resolve(buffer);
    });

    doc.on('error', (error) => {
      reject(error);
    });

    // Generate content
    generateContent(doc);

    // Finalize PDF
    doc.end();
  });
}

/**
 * Generate Timesheet PDF
 */
export async function generateTimesheetPDF(data: TimesheetPDFData, res: Response): Promise<void> {
  if (res.headersSent) {
    return;
  }

  try {
    const buffer = await generatePDFToBuffer((doc) => {
      // Header with background
      doc.rect(0, 0, 612, 80).fill('#34495e');
      doc.fontSize(24).fillColor('#ffffff').text('Timesheet Report', 50, 30, { align: 'left' });
      
      // Date Range
      if (data.dateRange.startDate || data.dateRange.endDate) {
        doc.fontSize(11).fillColor('#ecf0f1');
        const dateText = `${data.dateRange.startDate || 'N/A'} to ${data.dateRange.endDate || 'N/A'}`;
        doc.text(`Period: ${dateText}`, 50, 55, { align: 'left' });
      }

      let y = 100;

      // Summary Section
      doc.fontSize(16).fillColor('#2c3e50').text('Summary', 50, y);
      y += 25;

      // Summary boxes
      const boxWidth = 115;
      const boxHeight = 60;
      const boxSpacing = 10;
      const startX = 50;

      drawSummaryBox(doc, startX, y, boxWidth, boxHeight, 'Total Hours', data.summary.totalHours.toFixed(2), '#3498db');
      drawSummaryBox(doc, startX + boxWidth + boxSpacing, y, boxWidth, boxHeight, 'Billable Hours', data.summary.billableHours.toFixed(2), '#27ae60');
      drawSummaryBox(doc, startX + (boxWidth + boxSpacing) * 2, y, boxWidth, boxHeight, 'Non-Billable', data.summary.nonBillableHours.toFixed(2), '#e74c3c');
      drawSummaryBox(doc, startX + (boxWidth + boxSpacing) * 3, y, boxWidth, boxHeight, 'Total Entries', data.summary.totalEntries.toString(), '#f39c12');

      y += boxHeight + 30;

      // Entries Section
      doc.fontSize(16).fillColor('#2c3e50').text('Timesheet Entries', 50, y);
      y += 25;

      if (data.entries.length === 0) {
        doc.fontSize(11).fillColor('#7f8c8d');
        doc.text('No entries found for the selected date range.', 50, y);
      } else {
        // Table header
        y = drawTableRow(doc, y, [
          { text: 'Date', width: 80, align: 'left' },
          { text: 'Project', width: 120, align: 'left' },
          { text: 'Task', width: 100, align: 'left' },
          { text: 'Hours', width: 60, align: 'center' },
          { text: 'Billable', width: 70, align: 'center' },
          { text: 'Status', width: 70, align: 'center' }
        ], true);

        // Table rows
        data.entries.forEach((entry, index) => {
          if (y > 700) {
            doc.addPage();
            y = 50;
            // Redraw header on new page
            y = drawTableRow(doc, y, [
              { text: 'Date', width: 80, align: 'left' },
              { text: 'Project', width: 120, align: 'left' },
              { text: 'Task', width: 100, align: 'left' },
              { text: 'Hours', width: 60, align: 'center' },
              { text: 'Billable', width: 70, align: 'center' },
              { text: 'Status', width: 70, align: 'center' }
            ], true);
          }

          const date = typeof entry.date === 'string' ? entry.date : dayjs(entry.date).format('MMM DD, YYYY');
          const hours = entry.hoursWorked || entry.hours;
          const task = entry.task || '-';
          const billable = entry.isBillable ? 'Yes' : 'No';
          
          // Status color
          let statusColor = '#7f8c8d';
          if (entry.status === 'approved') statusColor = '#27ae60';
          else if (entry.status === 'rejected') statusColor = '#e74c3c';
          else if (entry.status === 'submitted') statusColor = '#f39c12';
          else if (entry.status === 'draft') statusColor = '#95a5a6';

          // Alternate row background
          if (index % 2 === 0) {
            doc.rect(50, y, 500, 20).fill('#f8f9fa');
          }

          // Calculate status column position: 50 + 80 + 120 + 100 + 60 + 70 = 480
          const statusColumnStart = 480;
          const circleX = statusColumnStart + 5; // 5px padding from column start
          const circleRadius = 4;
          const textStartX = circleX + circleRadius + 5; // Circle + padding before text
          
          // Draw status indicator
          doc.circle(circleX, y + 10, circleRadius).fill(statusColor);
          
          // Draw all columns except status
          y = drawTableRow(doc, y, [
            { text: date, width: 80, align: 'left' },
            { text: entry.project, width: 120, align: 'left' },
            { text: task, width: 100, align: 'left' },
            { text: hours.toString(), width: 60, align: 'center' },
            { text: billable, width: 70, align: 'center' },
            { text: '', width: 70, align: 'left' } // Empty placeholder for status column
          ]);
          
          // Draw status text manually with offset
          doc.fontSize(9).fillColor('#000000');
          doc.text(entry.status.toUpperCase(), textStartX, y - 20 + 6, {
            width: statusColumnStart + 70 - textStartX,
            align: 'left'
          });
        });
      }

      // Footer
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).fillColor('#95a5a6');
        doc.text(
          `Generated on ${dayjs().format('MMMM DD, YYYY [at] HH:mm')} | Page ${i + 1} of ${pageCount}`,
          50,
          800,
          { align: 'center', width: 512 }
        );
      }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=timesheet-report-${Date.now()}.pdf`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', message: 'Failed to generate PDF' });
    }
  }
}

/**
 * Generate Leave PDF
 */
export async function generateLeavePDF(data: LeavePDFData, res: Response): Promise<void> {
  if (res.headersSent) {
    return;
  }

  try {
    const buffer = await generatePDFToBuffer((doc) => {
      // Header
      doc.rect(0, 0, 612, 80).fill('#34495e');
      doc.fontSize(24).fillColor('#ffffff').text('Leave Report', 50, 30, { align: 'left' });
      
      if (data.dateRange.startDate || data.dateRange.endDate) {
        doc.fontSize(11).fillColor('#ecf0f1');
        const dateText = `${data.dateRange.startDate || 'N/A'} to ${data.dateRange.endDate || 'N/A'}`;
        doc.text(`Period: ${dateText}`, 50, 55, { align: 'left' });
      }

      let y = 100;

      // Summary
      doc.fontSize(16).fillColor('#2c3e50').text('Summary', 50, y);
      y += 25;

      const boxWidth = 115;
      const boxHeight = 60;
      const boxSpacing = 10;
      const startX = 50;

      drawSummaryBox(doc, startX, y, boxWidth, boxHeight, 'Total Leaves', data.summary.totalLeaves.toString(), '#3498db');
      drawSummaryBox(doc, startX + boxWidth + boxSpacing, y, boxWidth, boxHeight, 'Total Days', data.summary.totalDays.toString(), '#27ae60');
      drawSummaryBox(doc, startX + (boxWidth + boxSpacing) * 2, y, boxWidth, boxHeight, 'Approved', data.summary.approved.toString(), '#27ae60');
      drawSummaryBox(doc, startX + (boxWidth + boxSpacing) * 3, y, boxWidth, boxHeight, 'Pending', data.summary.pending.toString(), '#f39c12');
      drawSummaryBox(doc, startX + (boxWidth + boxSpacing) * 4, y, boxWidth, boxHeight, 'Rejected', data.summary.rejected.toString(), '#e74c3c');

      y += boxHeight + 30;

      // Leave Requests
      doc.fontSize(16).fillColor('#2c3e50').text('Leave Requests', 50, y);
      y += 25;

      if (data.leaves.length === 0) {
        doc.fontSize(11).fillColor('#7f8c8d');
        doc.text('No leave requests found for the selected date range.', 50, y);
      } else {
        // Table header
        y = drawTableRow(doc, y, [
          { text: 'Employee', width: 120, align: 'left' },
          { text: 'Leave Type', width: 100, align: 'left' },
          { text: 'Start Date', width: 90, align: 'left' },
          { text: 'End Date', width: 90, align: 'left' },
          { text: 'Days', width: 50, align: 'center' },
          { text: 'Status', width: 80, align: 'center' }
        ], true);

        data.leaves.forEach((leave, index) => {
          if (y > 700) {
            doc.addPage();
            y = 50;
            y = drawTableRow(doc, y, [
              { text: 'Employee', width: 120, align: 'left' },
              { text: 'Leave Type', width: 100, align: 'left' },
              { text: 'Start Date', width: 90, align: 'left' },
              { text: 'End Date', width: 90, align: 'left' },
              { text: 'Days', width: 50, align: 'center' },
              { text: 'Status', width: 80, align: 'center' }
            ], true);
          }

          const userId = typeof leave.userId === 'object' 
            ? `${leave.userId.firstName} ${leave.userId.lastName}`
            : leave.userId;
          const startDate = typeof leave.startDate === 'string' ? leave.startDate : dayjs(leave.startDate).format('MMM DD, YYYY');
          const endDate = typeof leave.endDate === 'string' ? leave.endDate : dayjs(leave.endDate).format('MMM DD, YYYY');
          
          let statusColor = '#7f8c8d';
          if (leave.status === 'approved') statusColor = '#27ae60';
          else if (leave.status === 'rejected') statusColor = '#e74c3c';
          else if (leave.status === 'pending') statusColor = '#f39c12';

          if (index % 2 === 0) {
            doc.rect(50, y, 500, 20).fill('#f8f9fa');
          }

          // Calculate status column position: 50 + 120 + 100 + 90 + 90 + 50 = 500
          const statusColumnStart = 500;
          const circleX = statusColumnStart + 5; // 5px padding from column start
          const circleRadius = 4;
          const textStartX = circleX + circleRadius + 5; // Circle + padding before text
          
          // Draw status indicator
          doc.circle(circleX, y + 10, circleRadius).fill(statusColor);
          
          // Draw all columns except status
          y = drawTableRow(doc, y, [
            { text: userId, width: 120, align: 'left' },
            { text: leave.leaveType, width: 100, align: 'left' },
            { text: startDate, width: 90, align: 'left' },
            { text: endDate, width: 90, align: 'left' },
            { text: leave.totalDays.toString(), width: 50, align: 'center' },
            { text: '', width: 80, align: 'left' } // Empty placeholder for status column
          ]);
          
          // Draw status text manually with offset
          doc.fontSize(9).fillColor('#000000');
          doc.text(leave.status.toUpperCase(), textStartX, y - 20 + 6, {
            width: statusColumnStart + 80 - textStartX,
            align: 'left'
          });
        });
      }

      // Footer
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).fillColor('#95a5a6');
        doc.text(
          `Generated on ${dayjs().format('MMMM DD, YYYY [at] HH:mm')} | Page ${i + 1} of ${pageCount}`,
          50,
          800,
          { align: 'center', width: 512 }
        );
      }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=leave-report-${Date.now()}.pdf`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', message: 'Failed to generate PDF' });
    }
  }
}

/**
 * Generate Team PDF
 */
export async function generateTeamPDF(data: TeamPDFData, res: Response): Promise<void> {
  if (res.headersSent) {
    return;
  }

  try {
    const buffer = await generatePDFToBuffer((doc) => {
      // Header
      doc.rect(0, 0, 612, 80).fill('#34495e');
      doc.fontSize(24).fillColor('#ffffff').text('Team Report', 50, 30, { align: 'left' });
      doc.fontSize(11).fillColor('#ecf0f1');
      doc.text(`Team Size: ${data.teamSize} members`, 50, 55, { align: 'left' });

      let y = 100;

      if (data.teamMembers.length === 0) {
        doc.fontSize(11).fillColor('#7f8c8d');
        doc.text('No team members found.', 50, y);
      } else {
        data.teamMembers.forEach((member, index) => {
          if (y > 700) {
            doc.addPage();
            y = 50;
          }

          // Member card
          doc.rect(50, y, 500, 100).fill('#ecf0f1').stroke('#bdc3c7');
          
          // Name
          doc.fontSize(14).fillColor('#2c3e50');
          const nameText = `${member.user.name}${member.user.employeeId ? ` (${member.user.employeeId})` : ''}`;
          doc.text(nameText, 60, y + 10);
          
          // Details
          doc.fontSize(10).fillColor('#7f8c8d');
          doc.text(`Email: ${member.user.email}`, 60, y + 30);
          doc.text(`Role: ${member.user.role}`, 60, y + 45);
          
          // Timesheet summary
          doc.fontSize(9).fillColor('#2c3e50');
          doc.text('Timesheet:', 60, y + 65);
          doc.fillColor('#3498db');
          doc.text(
            `Total: ${member.timesheetSummary.totalHours.toFixed(2)}h | Billable: ${member.timesheetSummary.billableHours.toFixed(2)}h | Entries: ${member.timesheetSummary.entriesCount}`,
            120,
            y + 65
          );
          
          // Leave summary
          doc.fillColor('#2c3e50');
          doc.text('Leave:', 60, y + 80);
          doc.fillColor('#27ae60');
          doc.text(
            `Total: ${member.leaveSummary.totalLeaves} | Days: ${member.leaveSummary.totalDays} | Pending: ${member.leaveSummary.pending}`,
            100,
            y + 80
          );

          y += 110;
        });
      }

      // Footer
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).fillColor('#95a5a6');
        doc.text(
          `Generated on ${dayjs().format('MMMM DD, YYYY [at] HH:mm')} | Page ${i + 1} of ${pageCount}`,
          50,
          800,
          { align: 'center', width: 512 }
        );
      }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=team-report-${Date.now()}.pdf`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', message: 'Failed to generate PDF' });
    }
  }
}
