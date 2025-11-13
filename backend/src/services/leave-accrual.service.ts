/**
 * Leave Accrual Service
 * Handles automatic leave accrual calculations
 */

import { User, OrganizationSettings, LeaveAccrualHistory } from '../models';
import { LeaveType } from '@shared/types';
import { EmailUtil } from '../utils';

export class LeaveAccrualService {
  /**
   * Run monthly accrual for all employees
   */
  static async runMonthlyAccrual(): Promise<{ success: number; failed: number; errors: string[] }> {
    console.log('🔄 Starting monthly leave accrual...');
    
    const results = { success: 0, failed: 0, errors: [] as string[] };
    
    try {
      // Get all active tenants
      const tenants = await this.getActiveTenants();
      
      for (const tenant of tenants) {
        try {
          await this.accrueForTenant(tenant.tenantId);
          results.success++;
        } catch (error: any) {
          results.failed++;
          results.errors.push(`Tenant ${tenant.tenantId}: ${error.message}`);
        }
      }
      
      console.log(`✅ Monthly accrual complete: ${results.success} tenants succeeded, ${results.failed} failed`);
      return results;
    } catch (error) {
      console.error('❌ Monthly accrual failed:', error);
      throw error;
    }
  }

  /**
   * Accrue leaves for a specific tenant
   */
  static async accrueForTenant(tenantId: string): Promise<number> {
    console.log(`  Processing tenant: ${tenantId}`);
    
    // Get tenant settings
    const settings = await OrganizationSettings.findOne({ tenantId });
    
    if (!settings || !settings.leavePolicies || settings.leavePolicies.length === 0) {
      console.log(`  ⚠️  No leave policies found for tenant ${tenantId}`);
      return 0;
    }

    // Get all active employees
    const employees = await User.find({
      tenantId,
      isActive: true,
      role: { $in: ['employee', 'supervisor'] }
    });

    const today = new Date();
    const currentYear = today.getFullYear();
    let processedCount = 0;

    for (const employee of employees) {
      try {
        for (const policy of settings.leavePolicies) {
          await this.accrueForEmployee(
            employee,
            policy,
            currentYear,
            tenantId
          );
        }
        processedCount++;
      } catch (error: any) {
        console.error(`  ❌ Error accruing for employee ${employee.email}:`, error.message);
      }
    }

    console.log(`  ✅ Accrued leaves for ${processedCount} employees`);
    return processedCount;
  }

  /**
   * Accrue leaves for a specific employee
   */
  static async accrueForEmployee(
    employee: any,
    policy: any,
    fiscalYear: number,
    tenantId: string
  ): Promise<void> {
    const leaveType = policy.leaveType as LeaveType;
    const accrualAmount = policy.accrualRate || 0;
    
    if (accrualAmount <= 0) {
      return; // No accrual for this leave type
    }

    // Pro-rated accrual for new joiners
    let actualAccrual = accrualAmount;
    if (employee.joiningDate) {
      const joinDate = new Date(employee.joiningDate);
      const today = new Date();
      const monthsSinceJoining = this.getMonthsBetween(joinDate, today);
      
      if (monthsSinceJoining < 1) {
        // First month - pro-rated
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const daysWorked = Math.max(1, daysInMonth - joinDate.getDate() + 1);
        actualAccrual = (accrualAmount / daysInMonth) * daysWorked;
      }
    }

    // Get current balance (simple number in current schema)
    const currentBalance = (employee.leaveBalance as any)?.[leaveType] || 0;
    const newBalance = currentBalance + actualAccrual;

    // Check max carry-over if applicable
    const maxTotal = policy.annualAllocation + (policy.maxCarryOver || 0);
    const finalBalance = Math.min(newBalance, maxTotal);

    // Update user balance (simple number)
    if (!employee.leaveBalance) {
      employee.leaveBalance = {
        annual: 0,
        sick: 0,
        personal: 0,
        unpaid: 0,
        maternity: 0,
        paternity: 0
      };
    }
    
    (employee.leaveBalance as any)[leaveType] = finalBalance;
    
    await employee.save();

    // Record in history
    await LeaveAccrualHistory.create({
      tenantId,
      userId: String(employee._id),
      leaveType,
      amount: actualAccrual,
      reason: 'Monthly accrual',
      balance: {
        before: currentBalance,
        after: finalBalance
      },
      accrualDate: new Date(),
      fiscalYear
    });
  }

  /**
   * Run annual reset
   */
  static async runAnnualReset(): Promise<{ success: number; failed: number }> {
    console.log('🔄 Starting annual leave reset...');
    
    const results = { success: 0, failed: 0 };
    
    try {
      const tenants = await this.getActiveTenants();
      
      for (const tenant of tenants) {
        try {
          await this.resetForTenant(tenant.tenantId);
          results.success++;
        } catch (error) {
          results.failed++;
          console.error(`Failed to reset for tenant ${tenant.tenantId}:`, error);
        }
      }
      
      console.log(`✅ Annual reset complete: ${results.success} tenants succeeded, ${results.failed} failed`);
      return results;
    } catch (error) {
      console.error('❌ Annual reset failed:', error);
      throw error;
    }
  }

  /**
   * Reset leaves for a tenant
   */
  static async resetForTenant(tenantId: string): Promise<void> {
    const settings = await OrganizationSettings.findOne({ tenantId });
    
    if (!settings) {
      throw new Error('Settings not found');
    }

    const employees = await User.find({
      tenantId,
      isActive: true,
      role: { $in: ['employee', 'supervisor'] }
    });

    const currentYear = new Date().getFullYear();

    for (const employee of employees) {
      for (const policy of settings.leavePolicies) {
        const leaveType = policy.leaveType as LeaveType;
        const currentBalance = (employee.leaveBalance as any)?.[leaveType] || 0;
        const carryOver = Math.min(currentBalance, policy.maxCarryOver || 0);
        const newTotal = policy.annualAllocation + carryOver;

        // Reset balance (simple number)
        if (!employee.leaveBalance) {
          employee.leaveBalance = {
            annual: 0,
            sick: 0,
            personal: 0,
            unpaid: 0,
            maternity: 0,
            paternity: 0
          };
        }
        (employee.leaveBalance as any)[leaveType] = newTotal;

        // Record in history
        await LeaveAccrualHistory.create({
          tenantId,
          userId: String(employee._id),
          leaveType,
          amount: newTotal,
          reason: 'Annual reset',
          balance: {
            before: currentBalance,
            after: newTotal
          },
          accrualDate: new Date(),
          fiscalYear: currentYear
        });
      }
      
      await employee.save();
    }
  }

  /**
   * Manual accrual for a specific user
   */
  static async manualAccrual(
    userId: string,
    tenantId: string,
    leaveType: LeaveType,
    amount: number,
    reason: string,
    createdBy: string
  ): Promise<void> {
    const employee = await User.findOne({ _id: userId, tenantId });
    
    if (!employee) {
      throw new Error('Employee not found');
    }

    const currentBalance = (employee.leaveBalance as any)?.[leaveType] || 0;
    const newBalance = currentBalance + amount;

    if (!employee.leaveBalance) {
      employee.leaveBalance = {
        annual: 0,
        sick: 0,
        personal: 0,
        unpaid: 0,
        maternity: 0,
        paternity: 0
      };
    }
    
    (employee.leaveBalance as any)[leaveType] = newBalance;
    
    await employee.save();

    // Record in history
    await LeaveAccrualHistory.create({
      tenantId,
      userId,
      leaveType,
      amount,
      reason,
      balance: {
        before: currentBalance,
        after: newBalance
      },
      accrualDate: new Date(),
      fiscalYear: new Date().getFullYear(),
      createdBy
    });
  }

  /**
   * Helper methods
   */
  private static async getActiveTenants(): Promise<{ tenantId: string }[]> {
    const Tenant = require('../models/tenant.model').default;
    const tenants = await Tenant.find({ isActive: true }).select('_id');
    return tenants.map((t: any) => ({ tenantId: String(t._id) }));
  }

  private static getMonthsBetween(start: Date, end: Date): number {
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return months;
  }
}

