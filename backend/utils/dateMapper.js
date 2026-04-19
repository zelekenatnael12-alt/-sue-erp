/**
 * Ethiopian Date Mapper for SUE Fiscal Year
 * SUE Fiscal Year starts in Meskerem (September)
 */

const ETHIOPIAN_MONTHS = [
  'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
  'Megabit', 'Miyazia', 'Ginbot', 'Sene', 'Hamle', 'Nehasse'
];

/**
 * Maps an Ethiopian month name to a matrix index (m1-m12)
 * @param {string} monthName 
 * @returns {string|null} - e.g. 'm1', 'm2', ...
 */
function monthToMatrixIndex(monthName) {
  if (!monthName) return null;
  const index = ETHIOPIAN_MONTHS.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
  return index !== -1 ? `m${index + 1}` : null;
}

/**
 * Maps a Gregorgian date to the corresponding Ethiopian month and matrix index
 * @param {Date} date 
 */
function dateToMatrixIndex(date) {
  const d = new Date(date);
  const month = d.getMonth(); // 0-indexed (0 = Jan, 8 = Sept)
  
  // Mapping Gregorian Months to Ethiopian Matrix Indices (Approximate)
  // Sept (8) -> m1
  // Oct (9) -> m2
  // ...
  // Dec (11) -> m4
  // Jan (0) -> m5
  // ...
  // Aug (7) -> m12
  
  let matrixIndex;
  if (month >= 8) { // Sept - Dec
    matrixIndex = month - 7; // 8-7=1, 9-7=2, 10-7=3, 11-7=4
  } else { // Jan - Aug
    matrixIndex = month + 5; // 0+5=5, 1+5=6, ..., 7+5=12
  }
  
  return `m${matrixIndex}`;
}

module.exports = {
  ETHIOPIAN_MONTHS,
  monthToMatrixIndex,
  dateToMatrixIndex
};
