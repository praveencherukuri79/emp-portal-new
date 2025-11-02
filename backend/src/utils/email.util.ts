import nodemailer, { Transporter } from 'nodemailer';
import { NotificationType } from '../types';

/**
 * Reusable Email Utility
 * Handles all email sending functionality
 */

interface IEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailUtil {
  private static transporter: Transporter;

  /**
   * Initialize email transporter
   */
  static initialize(): void {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  /**
   * Send email
   */
  static async send(options: IEmailOptions): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.initialize();
      }

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, '')
      });

      return true;
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordReset(email: string, resetToken: string, userName: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>We received a request to reset your password. Click the button below to reset it:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all;">${resetUrl}</p>
            <p>This link will expire in ${process.env.OTP_EXPIRY_MINUTES || 15} minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Employee Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.send({
      to: email,
      subject: 'Password Reset Request',
      html
    });
  }

  /**
   * Send timesheet notification
   */
  static async sendTimesheetNotification(
    email: string,
    userName: string,
    type: NotificationType,
    details: string
  ): Promise<boolean> {
    const subjects = {
      timesheet_submitted: 'Timesheet Submitted for Approval',
      timesheet_approved: 'Timesheet Approved',
      timesheet_rejected: 'Timesheet Rejected'
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${subjects[type as keyof typeof subjects]}</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>${details}</p>
            <p>Please log in to the Employee Portal to view details.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Employee Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.send({
      to: email,
      subject: subjects[type as keyof typeof subjects] || 'Notification',
      html
    });
  }

  /**
   * Send leave notification
   */
  static async sendLeaveNotification(
    email: string,
    userName: string,
    type: NotificationType,
    details: string
  ): Promise<boolean> {
    const subjects = {
      leave_submitted: 'Leave Request Submitted',
      leave_approved: 'Leave Request Approved',
      leave_rejected: 'Leave Request Rejected'
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${subjects[type as keyof typeof subjects]}</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>${details}</p>
            <p>Please log in to the Employee Portal to view details.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Employee Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.send({
      to: email,
      subject: subjects[type as keyof typeof subjects] || 'Notification',
      html
    });
  }

  /**
   * Send document expiry notification
   */
  static async sendDocumentExpiryNotification(
    email: string,
    userName: string,
    documentName: string,
    expiryDate: Date,
    daysLeft: number
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #F44336; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; }
          .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Document Expiring Soon</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <div class="warning">
              <strong>⚠️ Warning:</strong> Your document <strong>${documentName}</strong> is expiring soon!
            </div>
            <p><strong>Expiry Date:</strong> ${expiryDate.toLocaleDateString()}</p>
            <p><strong>Days Remaining:</strong> ${daysLeft} days</p>
            <p>Please upload a renewed version or take necessary action.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Employee Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.send({
      to: email,
      subject: `Document Expiring in ${daysLeft} Days - ${documentName}`,
      html
    });
  }

  /**
   * Send welcome email
   */
  static async sendWelcomeEmail(email: string, userName: string, tempPassword: string): Promise<boolean> {
    const loginUrl = `${process.env.FRONTEND_URL}/login`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; }
          .credentials { background-color: #e3f2fd; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Employee Portal!</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Welcome to the Employee Portal! Your account has been created successfully.</p>
            <div class="credentials">
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Temporary Password:</strong> ${tempPassword}</p>
            </div>
            <p><strong>⚠️ Important:</strong> Please change your password after first login.</p>
            <a href="${loginUrl}" class="button">Login Now</a>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Employee Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.send({
      to: email,
      subject: 'Welcome to Employee Portal',
      html
    });
  }
}
