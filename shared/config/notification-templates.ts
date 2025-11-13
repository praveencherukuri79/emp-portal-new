/**
 * Notification Templates Configuration
 * Centralized notification message templates
 * Use placeholders like {variable} for dynamic values
 */

export const NOTIFICATION_TEMPLATES = {
  /**
   * Timesheet Notifications
   */
  TIMESHEET: {
    SUBMITTED: {
      TITLE: 'Timesheet Submitted',
      MESSAGE: 'Your timesheet for week {weekStart} - {weekEnd} has been submitted for approval.',
      EMAIL_SUBJECT: 'Timesheet Submitted - Week of {weekStart}',
      EMAIL_BODY: `
        <p>Hello {userName},</p>
        <p>Your timesheet for the week of <strong>{weekStart}</strong> has been successfully submitted for approval.</p>
        <p><strong>Summary:</strong></p>
        <ul>
          <li>Total Hours: {totalHours}</li>
          <li>Billable Hours: {billableHours}</li>
          <li>Submitted: {submittedAt}</li>
        </ul>
        <p>You will be notified once your timesheet has been reviewed.</p>
      `,
    },
    APPROVED: {
      TITLE: 'Timesheet Approved',
      MESSAGE: 'Your timesheet for week {weekStart} - {weekEnd} has been approved by {approverName}.',
      EMAIL_SUBJECT: 'Timesheet Approved - Week of {weekStart}',
      EMAIL_BODY: `
        <p>Hello {userName},</p>
        <p>Good news! Your timesheet for the week of <strong>{weekStart}</strong> has been approved.</p>
        <p><strong>Approved By:</strong> {approverName}</p>
        <p><strong>Approval Date:</strong> {approvedAt}</p>
        <p>Thank you for your timely submission!</p>
      `,
    },
    REJECTED: {
      TITLE: 'Timesheet Rejected',
      MESSAGE: 'Your timesheet for week {weekStart} - {weekEnd} has been rejected. Reason: {reason}',
      EMAIL_SUBJECT: 'Timesheet Rejected - Week of {weekStart}',
      EMAIL_BODY: `
        <p>Hello {userName},</p>
        <p>Your timesheet for the week of <strong>{weekStart}</strong> has been rejected and requires revision.</p>
        <p><strong>Reason:</strong> {reason}</p>
        <p><strong>Rejected By:</strong> {rejectedBy}</p>
        <p>Please review the feedback and resubmit your timesheet.</p>
      `,
    },
    APPROVAL_PENDING: {
      TITLE: 'Timesheet Approval Pending',
      MESSAGE: '{employeeName} has submitted a timesheet for week {weekStart} - {weekEnd} ({totalHours} hours).',
      EMAIL_SUBJECT: 'Timesheet Approval Required - {employeeName}',
      EMAIL_BODY: `
        <p>Hello {approverName},</p>
        <p><strong>{employeeName}</strong> has submitted a timesheet requiring your approval.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>Week: {weekStart} - {weekEnd}</li>
          <li>Total Hours: {totalHours}</li>
          <li>Billable Hours: {billableHours}</li>
          <li>Submitted: {submittedAt}</li>
        </ul>
        <p>Please review and approve/reject the timesheet at your earliest convenience.</p>
      `,
    },
  },

  /**
   * Leave Notifications
   */
  LEAVE: {
    SUBMITTED: {
      TITLE: 'Leave Request Submitted',
      MESSAGE: 'Your {leaveType} leave request from {startDate} to {endDate} ({totalDays} days) has been submitted.',
      EMAIL_SUBJECT: 'Leave Request Submitted',
      EMAIL_BODY: `
        <p>Hello {userName},</p>
        <p>Your leave request has been successfully submitted for approval.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>Type: {leaveType}</li>
          <li>From: {startDate}</li>
          <li>To: {endDate}</li>
          <li>Days: {totalDays}</li>
          <li>Reason: {reason}</li>
        </ul>
        <p>You will be notified once your request has been reviewed.</p>
      `,
    },
    APPROVED: {
      TITLE: 'Leave Request Approved',
      MESSAGE: 'Your {leaveType} leave request from {startDate} to {endDate} has been approved.',
      EMAIL_SUBJECT: 'Leave Request Approved',
      EMAIL_BODY: `
        <p>Hello {userName},</p>
        <p>Your leave request has been approved!</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>Type: {leaveType}</li>
          <li>From: {startDate}</li>
          <li>To: {endDate}</li>
          <li>Days: {totalDays}</li>
          <li>Approved By: {approverName}</li>
        </ul>
        <p>Enjoy your time off!</p>
      `,
    },
    REJECTED: {
      TITLE: 'Leave Request Rejected',
      MESSAGE: 'Your {leaveType} leave request from {startDate} to {endDate} has been rejected. Reason: {reason}',
      EMAIL_SUBJECT: 'Leave Request Rejected',
      EMAIL_BODY: `
        <p>Hello {userName},</p>
        <p>Your leave request has been rejected.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>Type: {leaveType}</li>
          <li>From: {startDate}</li>
          <li>To: {endDate}</li>
          <li>Days: {totalDays}</li>
          <li>Reason: {reason}</li>
          <li>Rejected By: {rejectedBy}</li>
        </ul>
        <p>Please contact {rejectedBy} if you have any questions.</p>
      `,
    },
    CANCELLED: {
      TITLE: 'Leave Request Cancelled',
      MESSAGE: 'Your {leaveType} leave request from {startDate} to {endDate} has been cancelled.',
      EMAIL_SUBJECT: 'Leave Request Cancelled',
      EMAIL_BODY: `
        <p>Hello {userName},</p>
        <p>Your leave request has been cancelled as requested.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>Type: {leaveType}</li>
          <li>From: {startDate}</li>
          <li>To: {endDate}</li>
          <li>Days: {totalDays}</li>
        </ul>
      `,
    },
    APPROVAL_PENDING: {
      TITLE: 'Leave Approval Pending',
      MESSAGE: '{employeeName} has requested {leaveType} leave from {startDate} to {endDate} ({totalDays} days).',
      EMAIL_SUBJECT: 'Leave Approval Required - {employeeName}',
      EMAIL_BODY: `
        <p>Hello {approverName},</p>
        <p><strong>{employeeName}</strong> has submitted a leave request requiring your approval.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>Type: {leaveType}</li>
          <li>From: {startDate}</li>
          <li>To: {endDate}</li>
          <li>Days: {totalDays}</li>
          <li>Reason: {reason}</li>
        </ul>
        <p>Current Balance: {currentBalance} days</p>
        <p>Please review and approve/reject the request.</p>
      `,
    },
  },

  /**
   * Document Notifications
   */
  DOCUMENT: {
    EXPIRING_SOON: {
      TITLE: 'Document Expiring Soon',
      MESSAGE: 'Your {category} document "{documentName}" will expire on {expiryDate} ({daysRemaining} days remaining).',
      EMAIL_SUBJECT: 'Document Expiring Soon - {category}',
      EMAIL_BODY: `
        <p>Hello {userName},</p>
        <p>This is a reminder that your <strong>{category}</strong> document is expiring soon.</p>
        <p><strong>Document:</strong> {documentName}</p>
        <p><strong>Expiry Date:</strong> {expiryDate}</p>
        <p><strong>Days Remaining:</strong> {daysRemaining}</p>
        <p>Please upload an updated document to avoid any disruption.</p>
      `,
    },
    EXPIRED: {
      TITLE: 'Document Expired',
      MESSAGE: 'Your {category} document "{documentName}" has expired as of {expiryDate}.',
      EMAIL_SUBJECT: 'Document Expired - Action Required',
      EMAIL_BODY: `
        <p>Hello {userName},</p>
        <p>Your <strong>{category}</strong> document has expired and requires immediate attention.</p>
        <p><strong>Document:</strong> {documentName}</p>
        <p><strong>Expired On:</strong> {expiryDate}</p>
        <p>Please upload an updated document as soon as possible.</p>
      `,
    },
    UPLOADED: {
      TITLE: 'Document Uploaded',
      MESSAGE: 'Your {category} document "{documentName}" has been uploaded successfully.',
      EMAIL_SUBJECT: 'Document Uploaded Successfully',
      EMAIL_BODY: `
        <p>Hello {userName},</p>
        <p>Your document has been uploaded successfully.</p>
        <p><strong>Category:</strong> {category}</p>
        <p><strong>Document:</strong> {documentName}</p>
        <p><strong>Upload Date:</strong> {uploadDate}</p>
      `,
    },
    SHARED: {
      TITLE: 'Document Shared',
      MESSAGE: '{sharerName} has shared a {category} document with you: "{documentName}".',
      EMAIL_SUBJECT: 'Document Shared with You',
      EMAIL_BODY: `
        <p>Hello {userName},</p>
        <p><strong>{sharerName}</strong> has shared a document with you.</p>
        <p><strong>Category:</strong> {category}</p>
        <p><strong>Document:</strong> {documentName}</p>
        <p>You can view this document in your Documents section.</p>
      `,
    },
  },

  /**
   * User & Account Notifications
   */
  USER: {
    WELCOME: {
      TITLE: 'Welcome to Employee Portal',
      MESSAGE: 'Welcome, {userName}! Your account has been created successfully.',
      EMAIL_SUBJECT: 'Welcome to Employee Portal',
      EMAIL_BODY: `
        <h2>Welcome to Employee Portal!</h2>
        <p>Hello {userName},</p>
        <p>Your account has been created successfully. Here are your account details:</p>
        <ul>
          <li>Email: {email}</li>
          <li>Role: {role}</li>
          <li>Employee ID: {employeeId}</li>
        </ul>
        <p>Please log in and complete your profile.</p>
      `,
    },
    PASSWORD_RESET: {
      TITLE: 'Password Reset Request',
      MESSAGE: 'A password reset has been requested for your account.',
      EMAIL_SUBJECT: 'Password Reset Request',
      EMAIL_BODY: `
        <p>Hello {userName},</p>
        <p>We received a request to reset your password. Click the link below to reset it:</p>
        <p><a href="{resetLink}">Reset Password</a></p>
        <p>This link will expire in {expiryHours} hours.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    },
    PASSWORD_CHANGED: {
      TITLE: 'Password Changed',
      MESSAGE: 'Your password has been changed successfully.',
      EMAIL_SUBJECT: 'Password Changed Successfully',
      EMAIL_BODY: `
        <p>Hello {userName},</p>
        <p>Your password has been changed successfully.</p>
        <p><strong>Changed At:</strong> {changedAt}</p>
        <p>If you didn't make this change, please contact support immediately.</p>
      `,
    },
    PROFILE_UPDATED: {
      TITLE: 'Profile Updated',
      MESSAGE: 'Your profile has been updated successfully.',
      EMAIL_SUBJECT: 'Profile Updated',
      EMAIL_BODY: `
        <p>Hello {userName},</p>
        <p>Your profile has been updated successfully.</p>
        <p><strong>Updated Fields:</strong> {updatedFields}</p>
        <p><strong>Updated At:</strong> {updatedAt}</p>
      `,
    },
  },

  /**
   * System Notifications
   */
  SYSTEM: {
    MAINTENANCE: {
      TITLE: 'Scheduled Maintenance',
      MESSAGE: 'System maintenance is scheduled from {startTime} to {endTime}.',
      EMAIL_SUBJECT: 'Scheduled System Maintenance',
      EMAIL_BODY: `
        <p>Dear User,</p>
        <p>We will be performing scheduled maintenance on the Employee Portal.</p>
        <p><strong>Start Time:</strong> {startTime}</p>
        <p><strong>End Time:</strong> {endTime}</p>
        <p><strong>Duration:</strong> {duration}</p>
        <p>The system will be unavailable during this time. We apologize for any inconvenience.</p>
      `,
    },
    ANNOUNCEMENT: {
      TITLE: 'System Announcement',
      MESSAGE: '{title}',
      EMAIL_SUBJECT: 'Important Announcement - {title}',
      EMAIL_BODY: `
        <h2>{title}</h2>
        <p>{message}</p>
        <p><strong>Posted By:</strong> {postedBy}</p>
        <p><strong>Posted On:</strong> {postedAt}</p>
      `,
    },
  },
} as const;

/**
 * Type for notification templates
 */
export type NotificationTemplates = typeof NOTIFICATION_TEMPLATES;

/**
 * Replace placeholders in template string
 * @param template Template string with {placeholder} markers
 * @param values Object with placeholder values
 * @returns Processed string
 */
export function processTemplate(template: string, values: Record<string, any>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key] !== undefined ? String(values[key]) : match;
  });
}

/**
 * Get notification template
 * @param category Category (e.g., 'TIMESHEET', 'LEAVE')
 * @param type Type (e.g., 'SUBMITTED', 'APPROVED')
 * @returns Template object or null
 */
export function getNotificationTemplate(
  category: keyof typeof NOTIFICATION_TEMPLATES,
  type: string
): any {
  const categoryTemplates = NOTIFICATION_TEMPLATES[category] as any;
  return categoryTemplates?.[type] || null;
}

/**
 * Generate notification message from template
 * @param category Category (e.g., 'TIMESHEET')
 * @param type Type (e.g., 'SUBMITTED')
 * @param values Placeholder values
 * @returns Processed message
 */
export function generateNotificationMessage(
  category: keyof typeof NOTIFICATION_TEMPLATES,
  type: string,
  values: Record<string, any>
): { title: string; message: string } | null {
  const template = getNotificationTemplate(category, type);
  if (!template) return null;

  return {
    title: processTemplate(template.TITLE, values),
    message: processTemplate(template.MESSAGE, values),
  };
}

/**
 * Generate email from template
 * @param category Category (e.g., 'TIMESHEET')
 * @param type Type (e.g., 'SUBMITTED')
 * @param values Placeholder values
 * @returns Email object with subject and body
 */
export function generateEmail(
  category: keyof typeof NOTIFICATION_TEMPLATES,
  type: string,
  values: Record<string, any>
): { subject: string; body: string } | null {
  const template = getNotificationTemplate(category, type);
  if (!template) return null;

  return {
    subject: processTemplate(template.EMAIL_SUBJECT, values),
    body: processTemplate(template.EMAIL_BODY, values),
  };
}

