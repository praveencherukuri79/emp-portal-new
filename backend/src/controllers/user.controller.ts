import { Response } from 'express';
import { User } from '../models';
import { ApiResponse } from '@utils/response.util';
import { IAuthRequest } from '../types';

export class UserController {
  /**
   * Get user profile
   */
  static async getProfile(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const user = await User.findById(req.user?.userId)
        .select('-password -refreshToken -passwordResetToken -emailVerificationToken')
        .populate('reportingTo', 'firstName lastName email employeeId');

      if (!user) {
        return ApiResponse.notFound(res, 'User not found');
        return;
      }

      return ApiResponse.success(res, user, 'Profile retrieved successfully');
    } catch (error) {
      console.error('Get profile error:', error);
      return ApiResponse.error(res, 'Failed to retrieve profile');
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { 
        firstName, 
        lastName, 
        dateOfBirth, 
        gender, 
        phone,
        avatar,
        address 
      } = req.body;

      const user = await User.findById(req.user?.userId);

      if (!user) {
        return ApiResponse.notFound(res, 'User not found');
        return;
      }

      // Update only allowed fields
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (dateOfBirth) user.dateOfBirth = dateOfBirth;
      if (gender) user.gender = gender;
      if (phone) user.phone = phone;
      if (avatar) user.avatar = avatar;
      if (address) user.address = address;

      await user.save();

      const userObj = user.toObject();
      const { password, refreshToken, ...updatedUser } = userObj;

      return ApiResponse.success(res, updatedUser, 'Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      return ApiResponse.error(res, 'Failed to update profile');
    }
  }

  /**
   * Update employee information (Admin/HR only)
   */
  static async updateEmployeeInfo(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { userId } = req.params;
      const {
        employeeId,
        department,
        designation,
        joiningDate,
        employmentType,
        salary,
        reportingTo,
        visa
      } = req.body;

      const user = await User.findOne({ 
        _id: userId, 
        tenantId: req.user?.tenantId 
      });

      if (!user) {
        return ApiResponse.notFound(res, 'User not found');
        return;
      }

      // Update employee information
      if (employeeId) user.employeeId = employeeId;
      if (department) user.department = department;
      if (designation) user.designation = designation;
      if (joiningDate) user.joiningDate = joiningDate;
      if (employmentType) user.employmentType = employmentType;
      if (salary) user.salary = salary;
      if (reportingTo) user.reportingTo = reportingTo;
      if (visa) user.visa = visa;

      await user.save();

      const userObj = user.toObject();
      const { password, refreshToken, ...updatedUser } = userObj;

      return ApiResponse.success(res, updatedUser, 'Employee information updated successfully');
    } catch (error) {
      console.error('Update employee info error:', error);
      return ApiResponse.error(res, 'Failed to update employee information');
    }
  }

  /**
   * Get all users (Admin/HR/Employer only)
   */
  static async getAllUsers(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { 
        page = 1, 
        limit = 10, 
        role, 
        department, 
        isActive, 
        search 
      } = req.query;

      const query: any = { tenantId: req.user?.tenantId };

      if (role) query.role = role;
      if (department) query.department = department;
      if (isActive !== undefined) query.isActive = isActive === 'true';
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { employeeId: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);

      const users = await User.find(query)
        .select('-password -refreshToken -passwordResetToken -emailVerificationToken')
        .populate('reportingTo', 'firstName lastName email employeeId')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

      const total = await User.countDocuments(query);

      return ApiResponse.success(res, {
        users,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalItems: total,
          itemsPerPage: Number(limit)
        }
      });
    } catch (error) {
      console.error('Get all users error:', error);
      return ApiResponse.error(res, 'Failed to retrieve users');
    }
  }

  /**
   * Get user by ID (Admin/HR/Employer or self)
   */
  static async getUserById(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { userId } = req.params;

      const user = await User.findOne({ 
        _id: userId, 
        tenantId: req.user?.tenantId 
      })
        .select('-password -refreshToken -passwordResetToken -emailVerificationToken')
        .populate('reportingTo', 'firstName lastName email employeeId');

      if (!user) {
        return ApiResponse.notFound(res, 'User not found');
        return;
      }

      return ApiResponse.success(res, user);
    } catch (error) {
      console.error('Get user by ID error:', error);
      return ApiResponse.error(res, 'Failed to retrieve user');
    }
  }

  /**
   * Create user (Admin only)
   */
  static async createUser(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const userData = {
        ...req.body,
        tenantId: req.user?.tenantId
      };

      const existingUser = await User.findOne({ 
        email: userData.email, 
        tenantId: userData.tenantId 
      });

      if (existingUser) {
        return ApiResponse.error(res, 'User with this email already exists');
        return;
      }

      const user = new User(userData);
      await user.save();

      const userObj = user.toObject();
      const { password, refreshToken, ...userObject } = userObj;

      return ApiResponse.created(res, userObject, 'User created successfully');
    } catch (error) {
      console.error('Create user error:', error);
      return ApiResponse.error(res, 'Failed to create user');
    }
  }

  /**
   * Update user role (Admin only)
   */
  static async updateUserRole(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      const user = await User.findOne({ 
        _id: userId, 
        tenantId: req.user?.tenantId 
      });

      if (!user) {
        return ApiResponse.notFound(res, 'User not found');
        return;
      }

      user.role = role;
      await user.save();

      const userObj = user.toObject();
      const { password, refreshToken, ...updatedUser } = userObj;

      return ApiResponse.success(res, updatedUser, 'User role updated successfully');
    } catch (error) {
      console.error('Update user role error:', error);
      return ApiResponse.error(res, 'Failed to update user role');
    }
  }

  /**
   * Deactivate user (Admin only)
   */
  static async deactivateUser(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { userId } = req.params;

      const user = await User.findOne({ 
        _id: userId, 
        tenantId: req.user?.tenantId 
      });

      if (!user) {
        return ApiResponse.notFound(res, 'User not found');
        return;
      }

      user.isActive = false;
      await user.save();

      return ApiResponse.success(res, null, 'User deactivated successfully');
    } catch (error) {
      console.error('Deactivate user error:', error);
      return ApiResponse.error(res, 'Failed to deactivate user');
    }
  }

  /**
   * Activate user (Admin only)
   */
  static async activateUser(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const { userId } = req.params;

      const user = await User.findOne({ 
        _id: userId, 
        tenantId: req.user?.tenantId 
      });

      if (!user) {
        return ApiResponse.notFound(res, 'User not found');
        return;
      }

      user.isActive = true;
      await user.save();

      return ApiResponse.success(res, null, 'User activated successfully');
    } catch (error) {
      console.error('Activate user error:', error);
      return ApiResponse.error(res, 'Failed to activate user');
    }
  }

  /**
   * Get team members (Supervisor)
   */
  static async getTeamMembers(req: IAuthRequest, res: Response): Promise<Response | void> {
    try {
      const teamMembers = await User.find({
        tenantId: req.user?.tenantId,
        reportingTo: req.user?.userId,
        isActive: true
      })
        .select('-password -refreshToken -passwordResetToken -emailVerificationToken')
        .sort({ firstName: 1 });

      return ApiResponse.success(res, teamMembers);
    } catch (error) {
      console.error('Get team members error:', error);
      return ApiResponse.error(res, 'Failed to retrieve team members');
    }
  }
}



