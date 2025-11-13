/**
 * Migration: Convert timesheet project field from String to ObjectId
 * 
 * This migration:
 * 1. Finds all unique project names in timesheet entries
 * 2. Creates Project documents for each unique name
 * 3. Updates all timesheet entries to reference the Project ObjectId
 * 4. Adds projectName field for backward compatibility
 */

import mongoose from 'mongoose';
import TimesheetEntry from '../models/timesheet.model';
import { Project } from '../models';
import Tenant from '../models/tenant.model';

interface OldTimesheetEntry {
  _id: mongoose.Types.ObjectId;
  project: string;
  tenantId: string;
  [key: string]: any;
}

export async function migrateProjectsToObjectId() {
  console.log('🔄 Starting migration: Convert timesheet projects to ObjectId...');

  try {
    // Get the active tenant (single-tenant setup)
    const tenant = await Tenant.findOne({ isActive: true });
    if (!tenant) {
      throw new Error('No active tenant found');
    }

    console.log(`✓ Found tenant: ${(tenant as any).organizationName || tenant._id}`);

    // Find all unique project names from timesheet entries
    const uniqueProjects = await TimesheetEntry.aggregate([
      {
        $match: {
          tenantId: String(tenant._id),
          project: { $type: 'string' } // Only get entries where project is still a string
        }
      },
      {
        $group: {
          _id: '$project',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    if (uniqueProjects.length === 0) {
      console.log('✓ No projects to migrate (all entries already use ObjectId)');
      return;
    }

    console.log(`✓ Found ${uniqueProjects.length} unique project names`);

    // Create Project documents for each unique name
    const projectMap = new Map<string, mongoose.Types.ObjectId>();

    for (const projectData of uniqueProjects) {
      const projectName = projectData._id;
      
      if (!projectName || projectName === '') {
        console.warn(`⚠️  Skipping empty project name`);
        continue;
      }

      // Check if project already exists
      let project = await Project.findOne({
        tenantId: String(tenant._id),
        name: projectName
      });

      if (!project) {
        // Create new project
        project = new Project({
          tenantId: String(tenant._id),
          name: projectName,
          code: projectName.toUpperCase().replace(/\s+/g, '_').substring(0, 20),
          description: `Migrated from timesheet entries`,
          status: 'active',
          isActive: true,
          assignedUsers: [] // Will be populated later if needed
        });

        await project.save();
        console.log(`  ✓ Created project: ${projectName} (${projectData.count} entries)`);
      } else {
        console.log(`  ✓ Project already exists: ${projectName}`);
      }

      projectMap.set(projectName, project._id as mongoose.Types.ObjectId);
    }

    console.log(`✓ Created/found ${projectMap.size} projects`);

    // Update all timesheet entries
    let updatedCount = 0;
    const batchSize = 100;

    for (const [projectName, projectId] of projectMap.entries()) {
      // Find all entries with this project name (as string)
      const entries = await TimesheetEntry.find({
        tenantId: String(tenant._id),
        project: projectName
      }).limit(batchSize);

      for (const entry of entries) {
        // Update the entry
        await TimesheetEntry.updateOne(
          { _id: entry._id },
          {
            $set: {
              project: projectId,
              projectName: projectName // Keep name for reference
            }
          }
        );

        updatedCount++;
      }
    }

    console.log(`✓ Updated ${updatedCount} timesheet entries`);

    // Verify migration
    const remainingStringProjects = await TimesheetEntry.countDocuments({
      tenantId: String(tenant._id),
      project: { $type: 'string' }
    });

    if (remainingStringProjects > 0) {
      console.warn(`⚠️  Warning: ${remainingStringProjects} entries still have string projects`);
    } else {
      console.log('✅ Migration completed successfully!');
    }

    return {
      projectsCreated: projectMap.size,
      entriesUpdated: updatedCount,
      remainingStringProjects
    };

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Allow running migration directly
if (require.main === module) {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/emp-portal';
  
  mongoose.connect(MONGODB_URI)
    .then(async () => {
      console.log('✓ Connected to MongoDB');
      await migrateProjectsToObjectId();
      await mongoose.disconnect();
      console.log('✓ Disconnected from MongoDB');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration error:', error);
      process.exit(1);
    });
}

