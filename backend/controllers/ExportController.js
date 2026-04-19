const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Converts JSON data to CSV string
 * @param {Array} data - Array of objects
 * @returns {string}
 */
function jsonToCsv(data) {
  if (!data || data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map(obj => 
    headers.map(header => {
      let val = obj[header];
      if (val === null || val === undefined) return '';
      if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
      return val;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

/**
 * Export Financial Records (Reports/Plans)
 */
async function exportFinancials(req, res) {
  try {
    const { regionId } = req.query;
    
    // Fetch approved reports with financial data
    const reports = await prisma.report.findMany({
      where: {
        status: 'APPROVED',
        author: regionId ? { regionId } : undefined
      },
      include: {
        author: {
          select: {
            full_name: true,
            region: { select: { name: true } },
            subRegion: { select: { name: true } },
            area: { select: { name: true } }
          }
        }
      }
    });

    // Flatten for CSV
    const reportData = reports.map(r => ({
      ID: r.id,
      Date: r.dateSubmitted.toISOString().split('T')[0],
      Title: r.title,
      Author: r.author?.full_name || 'System',
      Region: r.author?.region?.name || 'National',
      SubRegion: r.author?.subRegion?.name || '',
      Area: r.author?.area?.name || '',
      Amount_Raised: r.ministryRaised,
      Amount_Expended: r.ministryExpended,
      Expense_Claim: r.expenseAmount,
      Status: r.status
    }));

    const csv = jsonToCsv(reportData);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=financial_export.csv');
    res.status(200).send(csv);

  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).json({ error: 'Failed to generate financial export' });
  }
}

module.exports = { exportFinancials };
