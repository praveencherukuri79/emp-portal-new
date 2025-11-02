import { Model } from 'mongoose';
import { IDocument } from '../types';
import { BaseService } from './base.service';
import { QueryBuilder } from '../utils/query-builder.util';

export class DocumentService extends BaseService<IDocument> {
  constructor(model: Model<IDocument>) {
    super(model);
  }

  /**
   * Get documents by type
   */
  async getDocumentsByType(
    tenantId: string,
    documentType: string,
    page: number = 1,
    limit: number = 10
  ) {
    const query = new QueryBuilder<IDocument>(this.model)
      .withTenant(tenantId)
      .withFilter({ documentType })
      .paginate(page, limit)
      .sortBy('-uploadedAt')
      .populate('uploadedBy');

    return query.execute();
  }

  /**
   * Get user's documents
   */
  async getUserDocuments(
    tenantId: string,
    userId: string,
    documentType?: string,
    page: number = 1,
    limit: number = 10
  ) {
    const query = new QueryBuilder<IDocument>(this.model)
      .withTenant(tenantId)
      .withFilter({ uploadedBy: userId })
      .paginate(page, limit)
      .sortBy('-uploadedAt');

    if (documentType) {
      query.withFilter({ documentType });
    }

    return query.execute();
  }

  /**
   * Get documents uploaded in date range
   */
  async getDocumentsByDateRange(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    documentType?: string
  ) {
    const query = new QueryBuilder<IDocument>(this.model)
      .withTenant(tenantId)
      .withDateRange('uploadedAt', { startDate, endDate })
      .sortBy('-uploadedAt');

    if (documentType) {
      query.withFilter({ documentType });
    }

    return query.executeAll();
  }

  /**
   * Search documents by name or description
   */
  async searchDocuments(
    tenantId: string,
    searchTerm: string,
    page: number = 1,
    limit: number = 10
  ) {
    const filter = {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
      ],
    };

    const query = new QueryBuilder<IDocument>(this.model)
      .withTenant(tenantId)
      .withFilter(filter)
      .paginate(page, limit)
      .sortBy('-uploadedAt')
      .populate('uploadedBy');

    return query.execute();
  }

  /**
   * Get document statistics
   */
  async getDocumentStats(tenantId: string) {
    const [total, byType] = await Promise.all([
      this.model.countDocuments({ tenantId }),
      this.model.aggregate([
        { $match: { tenantId } },
        { $group: { _id: '$documentType', count: { $sum: 1 } } },
      ]),
    ]);

    const totalSize = await this.model.aggregate([
      { $match: { tenantId } },
      { $group: { _id: null, total: { $sum: '$size' } } },
    ]);

    return {
      total,
      byType: byType.map(item => ({
        type: item._id,
        count: item.count,
      })),
      totalSize: totalSize[0]?.total || 0,
    };
  }

  /**
   * Check if user can access document
   */
  async canUserAccess(
    documentId: string,
    userId: string,
    tenantId: string
  ): Promise<boolean> {
    const doc = await this.model.findOne({
      _id: documentId,
      tenantId,
      $or: [
        { uploadedBy: userId },
        { sharedWith: userId },
        { isPublic: true },
      ],
    });

    return !!doc;
  }

  /**
   * Share document with users
   */
  async shareDocument(
    documentId: string,
    tenantId: string,
    userIds: string[]
  ) {
    return this.model.findOneAndUpdate(
      { _id: documentId, tenantId },
      { $addToSet: { sharedWith: { $each: userIds } } },
      { new: true }
    );
  }

  /**
   * Unshare document from users
   */
  async unshareDocument(
    documentId: string,
    tenantId: string,
    userIds: string[]
  ) {
    return this.model.findOneAndUpdate(
      { _id: documentId, tenantId },
      { $pull: { sharedWith: { $in: userIds } } },
      { new: true }
    );
  }

  /**
   * Mark document as verified/approved
   */
  async verifyDocument(
    documentId: string,
    tenantId: string,
    verifiedBy: string,
    comments?: string
  ) {
    return this.updateById(documentId, {
      isVerified: true,
      verifiedBy,
      verifiedAt: new Date(),
      verificationComments: comments,
    } as any, { tenantId });
  }
}
