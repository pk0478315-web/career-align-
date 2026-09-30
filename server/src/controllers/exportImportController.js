const dbStore = require('../data/dbStore');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Format records to CSV string safely
 */
const convertToCsv = (items) => {
  if (!items || items.length === 0) return '';
  const headers = ['Title', 'Organization', 'Category', 'Deadline', 'Status', 'Location', 'Compensation', 'SourceURL'];
  const rows = items.map(item => {
    const opp = item.opportunity || item;
    return [
      `"${(opp.title || '').replace(/"/g, '""')}"`,
      `"${(opp.organization || '').replace(/"/g, '""')}"`,
      `"${(opp.category || '').replace(/"/g, '""')}"`,
      `"${opp.deadline || ''}"`,
      `"${item.status || 'saved'}"`,
      `"${(opp.location || '').replace(/"/g, '""')}"`,
      `"${(opp.fundingCompensation || '').replace(/"/g, '""')}"`,
      `"${opp.sourceUrl || opp.applicationUrl || ''}"`
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

const exportData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { format = 'json', scope = 'my-opportunities' } = req.query;

    let exportItems = [];
    if (scope === 'all') {
      exportItems = await dbStore.getOpportunities();
    } else {
      const result = await dbStore.getUserOpportunities(userId);
      exportItems = result.items;
    }

    if (format.toLowerCase() === 'csv') {
      const csv = convertToCsv(exportItems);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="student-opportunities-${Date.now()}.csv"`);
      return res.status(200).send(csv);
    }

    // Default JSON
    return sendSuccess(res, {
      scope,
      count: exportItems.length,
      exportedAt: new Date().toISOString(),
      items: exportItems
    });
  } catch (err) {
    next(err);
  }
};

const previewImport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return sendError(res, 'Array of records is required for import preview', 400, 'VALIDATION_ERROR');
    }

    const userOpps = await dbStore.getUserOpportunities(userId);
    const existingOppIds = new Set(userOpps.items.map(i => i.opportunityId));

    const preview = records.map((rec, idx) => {
      const isValid = Boolean(rec.title && rec.organization);
      const isDuplicate = existingOppIds.has(rec.opportunityId || rec.id);

      return {
        index: idx,
        title: rec.title || 'Untitled',
        organization: rec.organization || 'Unknown',
        category: rec.category || 'other',
        isValid,
        isDuplicate,
        validationIssue: !isValid ? 'Missing title or organization' : (isDuplicate ? 'Already in your saved opportunities' : null)
      };
    });

    return sendSuccess(res, {
      totalSubmitted: records.length,
      validCount: preview.filter(p => p.isValid).length,
      duplicateCount: preview.filter(p => p.isDuplicate).length,
      preview
    });
  } catch (err) {
    next(err);
  }
};

const confirmImport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { records, onDuplicate = 'skip' } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return sendError(res, 'Array of records required for import', 400, 'VALIDATION_ERROR');
    }

    let importedCount = 0;
    let skippedCount = 0;

    for (const rec of records) {
      if (!rec.title || !rec.organization) {
        skippedCount++;
        continue;
      }

      let oppId = rec.opportunityId;
      if (!oppId) {
        // Create as new opportunity
        const createdOpp = await dbStore.createOpportunity({
          title: rec.title,
          organization: rec.organization,
          category: rec.category || 'other',
          description: rec.description || '',
          sourceUrl: rec.sourceUrl || '',
          deadline: rec.deadline || null,
          location: rec.location || 'Remote',
          isRemote: rec.isRemote || false,
          fundingCompensation: rec.fundingCompensation || 'Not specified',
          sourceType: 'imported'
        });
        oppId = createdOpp.id;
      }

      try {
        await dbStore.trackOpportunity(userId, {
          opportunityId: oppId,
          status: rec.status || 'saved',
          notes: rec.notes || 'Imported via backup/CSV'
        });
        importedCount++;
      } catch {
        skippedCount++;
      }
    }

    return sendSuccess(res, {
      importedCount,
      skippedCount
    }, 201);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  exportData,
  previewImport,
  confirmImport
};
