import { Model, Document, FilterQuery } from 'mongoose';
import { QueryBuilder, DateRangeFilter } from '../utils/query-builder.util';

/**
 * Base Service Class
 * Provides common CRUD operations to reduce code duplication
 */

export interface CreateOptions {
  tenantId: string;
  userId?: string;
}

export interface FindOptions {
  tenantId: string;
  userId?: string;
  status?: string | string[];
  dateRange?: DateRangeFilter;
  dateField?: string;
}

export interface UpdateOptions {
  tenantId: string;
  userId?: string;
}

export class BaseService<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  /**
   * Create a new document
   */
  async create(data: Partial<T>, options: CreateOptions): Promise<T> {
    const document = new this.model({
      ...data,
      tenantId: options.tenantId,
      ...(options.userId && { userId: options.userId })
    });
    return document.save();
  }

  /**
   * Find document by ID
   */
  async findById(
    id: string,
    tenantId: string,
    populate?: string | string[]
  ): Promise<T | null> {
    const query = new QueryBuilder(this.model)
      .withTenant(tenantId)
      .withFilter({ _id: id } as FilterQuery<T>);

    if (populate) {
      query.populate(populate);
    }

    return query.executeOne();
  }

  /**
   * Find all documents with filters
   */
  async findAll(options: FindOptions, page?: number, limit?: number) {
    const query = new QueryBuilder(this.model).withTenant(options.tenantId);

    if (options.userId) {
      query.withUser(options.userId);
    }

    if (options.status) {
      query.withStatus(options.status);
    }

    if (options.dateRange && options.dateField) {
      query.withDateRange(options.dateField, options.dateRange);
    }

    if (page && limit) {
      query.paginate(page, limit);
      return query.execute();
    }

    const data = await query.executeAll();
    return { data, pagination: null };
  }

  /**
   * Update document by ID
   */
  async updateById(
    id: string,
    data: Partial<T>,
    options: UpdateOptions
  ): Promise<T | null> {
    return this.model.findOneAndUpdate(
      { 
        _id: id, 
        tenantId: options.tenantId,
        ...(options.userId && { userId: options.userId })
      } as FilterQuery<T>,
      { $set: data },
      { new: true, runValidators: true }
    );
  }

  /**
   * Delete document by ID
   */
  async deleteById(
    id: string,
    tenantId: string,
    userId?: string
  ): Promise<T | null> {
    return this.model.findOneAndDelete({
      _id: id,
      tenantId,
      ...(userId && { userId })
    } as FilterQuery<T>);
  }

  /**
   * Count documents
   */
  async count(filters: FilterQuery<T>): Promise<number> {
    return this.model.countDocuments(filters);
  }

  /**
   * Check if document exists
   */
  async exists(filters: FilterQuery<T>): Promise<boolean> {
    const count = await this.model.countDocuments(filters);
    return count > 0;
  }

  /**
   * Bulk create
   */
  async bulkCreate(items: Partial<T>[], options: CreateOptions): Promise<any[]> {
    const documents = items.map(item => ({
      ...item,
      tenantId: options.tenantId,
      ...(options.userId && { userId: options.userId })
    }));
    return this.model.insertMany(documents) as any;
  }

  /**
   * Bulk update
   */
  async bulkUpdate(
    ids: string[],
    data: Partial<T>,
    tenantId: string
  ): Promise<any> {
    return this.model.updateMany(
      { _id: { $in: ids }, tenantId } as FilterQuery<T>,
      { $set: data }
    );
  }

  /**
   * Bulk delete
   */
  async bulkDelete(ids: string[], tenantId: string): Promise<any> {
    return this.model.deleteMany({
      _id: { $in: ids },
      tenantId
    } as FilterQuery<T>);
  }
}
