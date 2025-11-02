import { Model } from 'mongoose';
import { IUser } from '../types';
import { BaseService } from './base.service';
import { QueryBuilder } from '../utils/query-builder.util';

export class UserService extends BaseService<IUser> {
  constructor(model: Model<IUser>) {
    super(model);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string, tenantId?: string): Promise<IUser | null> {
    const filter: any = { email };
    if (tenantId) {
      filter.tenantId = tenantId;
    }
    return this.model.findOne(filter);
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string, tenantId?: string): Promise<IUser | null> {
    const filter: any = { username };
    if (tenantId) {
      filter.tenantId = tenantId;
    }
    return this.model.findOne(filter);
  }

  /**
   * Get users by role
   */
  async getUsersByRole(
    tenantId: string,
    role: string,
    page: number = 1,
    limit: number = 10
  ) {
    const query = new QueryBuilder<IUser>(this.model)
      .withTenant(tenantId)
      .withFilter({ role })
      .paginate(page, limit)
      .sortBy('firstName lastName');

    return query.execute();
  }

  /**
   * Get users by department
   */
  async getUsersByDepartment(
    tenantId: string,
    department: string,
    page: number = 1,
    limit: number = 10
  ) {
    const query = new QueryBuilder<IUser>(this.model)
      .withTenant(tenantId)
      .withFilter({ department })
      .paginate(page, limit)
      .sortBy('firstName lastName');

    return query.execute();
  }

  /**
   * Search users by name or email
   */
  async searchUsers(
    tenantId: string,
    searchTerm: string,
    page: number = 1,
    limit: number = 10
  ) {
    const filter = {
      $or: [
        { firstName: { $regex: searchTerm, $options: 'i' } },
        { lastName: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { username: { $regex: searchTerm, $options: 'i' } },
      ],
    };

    const query = new QueryBuilder<IUser>(this.model)
      .withTenant(tenantId)
      .withFilter(filter)
      .paginate(page, limit)
      .sortBy('firstName lastName');

    return query.execute();
  }

  /**
   * Get active users
   */
  async getActiveUsers(
    tenantId: string,
    page: number = 1,
    limit: number = 10
  ) {
    const query = new QueryBuilder<IUser>(this.model)
      .withTenant(tenantId)
      .withStatus('active')
      .paginate(page, limit)
      .sortBy('firstName lastName');

    return query.execute();
  }

  /**
   * Update user password
   */
  async updatePassword(userId: string, tenantId: string, hashedPassword: string) {
    return this.updateById(userId, {
      password: hashedPassword,
      passwordChangedAt: new Date(),
    } as any, { tenantId });
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    tenantId: string,
    profileData: Partial<IUser>
  ) {
    // Remove sensitive fields
    const { password, refreshToken, role, ...safeData } = profileData as any;
    
    return this.updateById(userId, {
      ...safeData,
      updatedAt: new Date(),
    } as any, { tenantId });
  }

  /**
   * Activate or deactivate user
   */
  async toggleUserStatus(userId: string, tenantId: string, isActive: boolean) {
    const status = isActive ? 'active' : 'inactive';
    return this.updateById(userId, { status } as any, { tenantId });
  }

  /**
   * Update last login time
   */
  async updateLastLogin(userId: string) {
    return this.model.findByIdAndUpdate(
      userId,
      { lastLogin: new Date() },
      { new: true }
    );
  }

  /**
   * Get user statistics
   */
  async getUserStats(tenantId: string) {
    const [total, byRole, byDepartment, byStatus] = await Promise.all([
      this.model.countDocuments({ tenantId }),
      this.model.aggregate([
        { $match: { tenantId } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
      this.model.aggregate([
        { $match: { tenantId } },
        { $group: { _id: '$department', count: { $sum: 1 } } },
      ]),
      this.model.aggregate([
        { $match: { tenantId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      total,
      byRole: byRole.map(item => ({ role: item._id, count: item.count })),
      byDepartment: byDepartment.map(item => ({ department: item._id, count: item.count })),
      byStatus: byStatus.map(item => ({ status: item._id, count: item.count })),
    };
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string, tenantId?: string, excludeUserId?: string): Promise<boolean> {
    const filter: any = { email };
    if (tenantId) {
      filter.tenantId = tenantId;
    }
    if (excludeUserId) {
      filter._id = { $ne: excludeUserId };
    }
    const count = await this.model.countDocuments(filter);
    return count > 0;
  }

  /**
   * Check if username exists
   */
  async usernameExists(username: string, tenantId?: string, excludeUserId?: string): Promise<boolean> {
    const filter: any = { username };
    if (tenantId) {
      filter.tenantId = tenantId;
    }
    if (excludeUserId) {
      filter._id = { $ne: excludeUserId };
    }
    const count = await this.model.countDocuments(filter);
    return count > 0;
  }
}
