import { FilterQuery, Model, Document } from 'mongoose';
import { IAuthRequest } from '../types';

/**
 * Query Builder Utility
 * Reduces code duplication in controllers
 */

export interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: string;
  fields?: string;
  populate?: string | string[];
}

export interface DateRangeFilter {
  startDate?: string | Date;
  endDate?: string | Date;
}

export class QueryBuilder<T extends Document> {
  private model: Model<T>;
  private filters: FilterQuery<T> = {};
  private options: QueryOptions = {};

  constructor(model: Model<T>) {
    this.model = model;
  }

  /**
   * Add tenant filter
   */
  withTenant(tenantId: string): this {
    (this.filters as any).tenantId = tenantId;
    return this;
  }

  /**
   * Add user filter
   */
  withUser(userId: string): this {
    (this.filters as any).userId = userId;
    return this;
  }

  /**
   * Add status filter
   */
  withStatus(status: string | string[]): this {
    if (Array.isArray(status)) {
      (this.filters as any).status = { $in: status };
    } else {
      (this.filters as any).status = status;
    }
    return this;
  }

  /**
   * Add date range filter
   */
  withDateRange(field: string, range: DateRangeFilter): this {
    if (range.startDate || range.endDate) {
      (this.filters as any)[field] = {};
      if (range.startDate) {
        (this.filters as any)[field].$gte = new Date(range.startDate);
      }
      if (range.endDate) {
        (this.filters as any)[field].$lte = new Date(range.endDate);
      }
    }
    return this;
  }

  /**
   * Add custom filter
   */
  withFilter(filter: FilterQuery<T>): this {
    this.filters = { ...this.filters, ...filter };
    return this;
  }

  /**
   * Set pagination
   */
  paginate(page: number = 1, limit: number = 10): this {
    this.options.page = Math.max(1, page);
    this.options.limit = Math.min(100, Math.max(1, limit));
    return this;
  }

  /**
   * Set sort
   */
  sortBy(sort: string): this {
    this.options.sort = sort;
    return this;
  }

  /**
   * Select fields
   */
  select(fields: string): this {
    this.options.fields = fields;
    return this;
  }

  /**
   * Populate relations
   */
  populate(populate: string | string[]): this {
    this.options.populate = populate;
    return this;
  }

  /**
   * Execute query and return paginated results
   */
  async execute() {
    const { page = 1, limit = 10, sort, fields, populate } = this.options;
    const skip = (page - 1) * limit;

    let query = this.model.find(this.filters);

    if (fields) {
      query = query.select(fields);
    }

    if (sort) {
      query = query.sort(sort);
    }

    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach(pop => query = query.populate(pop));
      } else {
        query = query.populate(populate);
      }
    }

    const [data, total] = await Promise.all([
      query.skip(skip).limit(limit).exec(),
      this.model.countDocuments(this.filters)
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total
      }
    };
  }

  /**
   * Execute query and return all results (no pagination)
   */
  async executeAll() {
    const { sort, fields, populate } = this.options;

    let query = this.model.find(this.filters);

    if (fields) {
      query = query.select(fields);
    }

    if (sort) {
      query = query.sort(sort);
    }

    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach(pop => query = query.populate(pop));
      } else {
        query = query.populate(populate);
      }
    }

    return query.exec();
  }

  /**
   * Execute query and return single result
   */
  async executeOne() {
    const { fields, populate } = this.options;

    let query = this.model.findOne(this.filters);

    if (fields) {
      query = query.select(fields);
    }

    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach(pop => query = query.populate(pop));
      } else {
        query = query.populate(populate);
      }
    }

    return query.exec();
  }

  /**
   * Count documents
   */
  async count(): Promise<number> {
    return this.model.countDocuments(this.filters);
  }
}

/**
 * Helper to extract tenant ID from request
 */
export const getTenantId = (req: IAuthRequest): string => {
  if (!req.user?.tenantId) {
    throw new Error('Tenant ID not found in request');
  }
  return req.user.tenantId;
};

/**
 * Helper to extract user ID from request
 */
export const getUserId = (req: IAuthRequest): string => {
  if (!req.user?.userId) {
    throw new Error('User ID not found in request');
  }
  return req.user.userId;
};

/**
 * Helper to extract pagination params from query
 */
export const getPaginationParams = (query: any): { page: number; limit: number } => {
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 10;
  return { page: Math.max(1, page), limit: Math.min(100, Math.max(1, limit)) };
};
