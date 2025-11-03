import { Request, Response } from 'express';
import { User, Tenant } from '../models';
import { ApiResponse } from '@utils/response.util';
import { UserRole, EmploymentType } from '../types';

/**
 * Admin Controller
 * Secure endpoints for manual user creation
 * Protected by ADMIN_SECRET_KEY
 */

export class AdminController {
  /**
   * Create new user (Admin only - requires secret key)
   * POST /api/v1/admin/create-user
   */
  static async createUser(req: Request, res: Response): Promise<Response | void> {
    try {
      const secretKey = req.headers['x-admin-secret'] as string;
      
      // Verify admin secret key
      if (!secretKey || secretKey !== process.env.ADMIN_SECRET_KEY) {
        return ApiResponse.error(res, 'Unauthorized: Invalid admin secret key', 401);
      }

      const {
        email,
        password,
        firstName,
        lastName,
        role,
        employeeId,
        department,
        designation,
        dateOfJoining,
        phone,
        employmentType
      } = req.body;

      // Validation
      if (!email || !password || !firstName || !lastName || !role) {
        return ApiResponse.error(res, 'Missing required fields: email, password, firstName, lastName, role', 400);
      }

      // Get default tenant (first tenant in system)
      let tenant = await Tenant.findOne();
      
      if (!tenant) {
        // Create default tenant if none exists
        tenant = await Tenant.create({
          name: 'Default Organization',
          domain: 'default',
          contactEmail: 'admin@default.com',
          contactPhone: '',
          isActive: true,
          subscription: {
            plan: 'enterprise',
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            maxUsers: 1000
          },
          settings: {
            workDaysPerWeek: 5,
            workHoursPerDay: 8,
            timezone: 'UTC',
            dateFormat: 'MM/DD/YYYY',
            currency: 'USD'
          }
        });
        console.log('✅ Default tenant created:', tenant._id);
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return ApiResponse.error(res, 'User with this email already exists', 409);
      }

      // Create user with automatic tenant assignment
      // Note: Password will be hashed by the User model's pre-save hook
      const user = await User.create({
        tenantId: tenant._id,
        email,
        password, // Don't hash here - let the model do it
        firstName,
        lastName,
        role: role || UserRole.EMPLOYEE,
        employeeId: employeeId || `EMP${Date.now()}`,
        department: department || 'General',
        designation: designation || 'Employee',
        dateOfJoining: dateOfJoining || new Date(),
        phone,
        employmentType: employmentType || EmploymentType.FULL_TIME,
        isEmailVerified: true, // Auto-verify for admin-created users
        isActive: true,
        status: 'active'
      });

      // Remove sensitive data from response
      const { password: _, refreshToken: __, ...userResponse } = user.toJSON();

      return ApiResponse.success(res, {
        user: userResponse,
        tenant: {
          id: tenant._id,
          name: tenant.name,
          domain: tenant.domain
        }
      }, 'User created successfully', 201);

    } catch (error: any) {
      console.error('Error creating user:', error);
      return ApiResponse.error(res, error.message || 'Failed to create user');
    }
  }

  /**
   * Bulk create users (Admin only - requires secret key)
   * POST /api/v1/admin/bulk-create-users
   */
  static async bulkCreateUsers(req: Request, res: Response): Promise<Response | void> {
    try {
      const secretKey = req.headers['x-admin-secret'] as string;
      
      // Verify admin secret key
      if (!secretKey || secretKey !== process.env.ADMIN_SECRET_KEY) {
        return ApiResponse.error(res, 'Unauthorized: Invalid admin secret key', 401);
      }

      const { users } = req.body;

      if (!Array.isArray(users) || users.length === 0) {
        return ApiResponse.error(res, 'Invalid input: users array is required', 400);
      }

      // Get default tenant
      let tenant = await Tenant.findOne();
      
      if (!tenant) {
        // Create default tenant if none exists
        tenant = await Tenant.create({
          name: 'Default Organization',
          domain: 'default',
          contactEmail: 'admin@default.com',
          contactPhone: '',
          isActive: true,
          subscription: {
            plan: 'enterprise',
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            maxUsers: 1000
          },
          settings: {
            workDaysPerWeek: 5,
            workHoursPerDay: 8,
            timezone: 'UTC',
            dateFormat: 'MM/DD/YYYY',
            currency: 'USD'
          }
        });
      }

      const results = {
        created: [] as any[],
        failed: [] as any[]
      };

      for (const userData of users) {
        try {
          const { email, password, firstName, lastName, role, ...rest } = userData;

          // Validation
          if (!email || !password || !firstName || !lastName) {
            results.failed.push({
              email,
              reason: 'Missing required fields'
            });
            continue;
          }

          // Check if user exists
          const existingUser = await User.findOne({ email });
          if (existingUser) {
            results.failed.push({
              email,
              reason: 'User already exists'
            });
            continue;
          }

          // Create user
          // Note: Password will be hashed by the User model's pre-save hook
          const user = await User.create({
            tenantId: tenant._id,
            email,
            password, // Don't hash here - let the model do it
            firstName,
            lastName,
            role: role || UserRole.EMPLOYEE,
            employeeId: rest.employeeId || `EMP${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
            department: rest.department || 'General',
            designation: rest.designation || 'Employee',
            dateOfJoining: rest.dateOfJoining || new Date(),
            phone: rest.phone,
            employmentType: rest.employmentType || EmploymentType.FULL_TIME,
            isEmailVerified: true,
            isActive: true,
            status: 'active'
          });

          const { password: _, refreshToken: __, ...userResponse } = user.toJSON();

          results.created.push(userResponse);

        } catch (error: any) {
          results.failed.push({
            email: userData.email,
            reason: error.message
          });
        }
      }

      return ApiResponse.success(res, {
        summary: {
          total: users.length,
          created: results.created.length,
          failed: results.failed.length
        },
        results,
        tenant: {
          id: tenant._id,
          name: tenant.name
        }
      }, 'Bulk user creation completed', 201);

    } catch (error: any) {
      console.error('Error in bulk user creation:', error);
      return ApiResponse.error(res, error.message || 'Failed to create users');
    }
  }

  /**
   * Get tenant info
   * GET /api/v1/admin/tenant
   */
  static async getTenant(req: Request, res: Response): Promise<Response | void> {
    try {
      const secretKey = req.headers['x-admin-secret'] as string;
      
      if (!secretKey || secretKey !== process.env.ADMIN_SECRET_KEY) {
        return ApiResponse.error(res, 'Unauthorized: Invalid admin secret key', 401);
      }

      const tenant = await Tenant.findOne();

      if (!tenant) {
        return ApiResponse.error(res, 'No tenant found', 404);
      }

      return ApiResponse.success(res, tenant, 'Tenant retrieved successfully');

    } catch (error: any) {
      console.error('Error getting tenant:', error);
      return ApiResponse.error(res, error.message || 'Failed to get tenant');
    }
  }

  /**
   * Update tenant settings
   * PUT /api/v1/admin/tenant
   */
  static async updateTenant(req: Request, res: Response): Promise<Response | void> {
    try {
      const secretKey = req.headers['x-admin-secret'] as string;
      
      if (!secretKey || secretKey !== process.env.ADMIN_SECRET_KEY) {
        return ApiResponse.error(res, 'Unauthorized: Invalid admin secret key', 401);
      }

      const { name, domain, settings } = req.body;

      let tenant = await Tenant.findOne();

      if (!tenant) {
        return ApiResponse.error(res, 'No tenant found', 404);
      }

      if (name) tenant.name = name;
      if (domain) tenant.domain = domain;
      if (settings) tenant.settings = { ...tenant.settings, ...settings };

      await tenant.save();

      return ApiResponse.success(res, tenant, 'Tenant updated successfully');

    } catch (error: any) {
      console.error('Error updating tenant:', error);
      return ApiResponse.error(res, error.message || 'Failed to update tenant');
    }
  }
}
