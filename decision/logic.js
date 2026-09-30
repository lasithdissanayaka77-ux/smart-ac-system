
function decide({ temp, occupied, target = 24, tolerance = 1, override = 'auto' }) {
  if (override === 'cool') return { action: 'cool', reason: 'manual override: cool', triggered_by: 'manual' };
  if (override === 'off') return { action: 'off', reason: 'manual override: off', triggered_by: 'manual' };
  if (!occupied) return { action: 'off', reason: 'zone unoccupied', triggered_by: 'auto' };
  if (temp > target + tolerance) return { action: 'cool', reason: 'occupied and too warm', triggered_by: 'auto' };
  if (temp < target - tolerance) return { action: 'off', reason: 'already cool enough', triggered_by: 'auto' };
  return { action: 'hold', reason: 'within comfort range', triggered_by: 'auto' };
}
module.exports = { decide };
