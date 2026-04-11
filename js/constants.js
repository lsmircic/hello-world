/* ============================================
   Football Tactics Board - Constants
   ============================================ */

// Team colors
var COLORS = {
  home: {
    fill: '#2563eb',
    stroke: '#1d4ed8',
    gkFill: '#eab308',
    gkStroke: '#ca8a04',
    text: '#ffffff',
    label: '#60a5fa'
  },
  away: {
    fill: '#dc2626',
    stroke: '#b91c1c',
    gkFill: '#22c55e',
    gkStroke: '#16a34a',
    text: '#ffffff',
    label: '#f87171'
  },
  ball: {
    fill: '#ffffff',
    stroke: '#333333'
  },
  field: {
    grass1: '#4a8c3f',
    grass2: '#438737',
    lines: '#ffffff',
    lineWidth: 2
  }
};

// FIFA standard field proportions (105m x 68m)
var FIELD = {
  aspectRatio: 105 / 68,
  padding: 0.04,  // fraction of canvas for padding around pitch

  // All as fractions of field width (105m)
  centerCircleR: 9.15 / 105,
  penaltyAreaDepth: 16.5 / 105,
  penaltyAreaWidth: 40.32 / 68,   // as fraction of field height
  goalAreaDepth: 5.5 / 105,
  goalAreaWidth: 18.32 / 68,
  penaltySpotDist: 11 / 105,
  penaltyArcR: 9.15 / 105,
  cornerArcR: 1 / 105,
  goalWidth: 7.32 / 68,           // as fraction of field height
  goalDepth: 2.44 / 105
};

// Player rendering
var PLAYER = {
  radiusFraction: 0.026,  // as fraction of field width
  minRadius: 14,
  maxRadius: 22,
  fontSize: 0.75,          // relative to radius
  labelFontSize: 0.55,     // relative to radius, for name labels
  highlightWidth: 3,
  highlightColor: 'rgba(255, 255, 255, 0.8)'
};

// Ball rendering
var BALL = {
  radiusFraction: 0.015,
  minRadius: 8,
  maxRadius: 14
};

// Formation definitions by outfield count
// Positions are arrays of [line1, line2, ...] where each number = players in that line
// Sorted from defense to attack (left to right for home)
var FORMATION_DEFS = {
  4: [
    { name: '1-2-1', lines: [1, 2, 1] },
    { name: '2-1-1', lines: [2, 1, 1] },
    { name: '1-1-2', lines: [1, 1, 2] },
    { name: 'Diamond', lines: [1, 2, 1] }  // same as 1-2-1, alias for clarity
  ],
  5: [
    { name: '1-2-2', lines: [1, 2, 2] },
    { name: '2-2-1', lines: [2, 2, 1] },
    { name: '2-1-2', lines: [2, 1, 2] }
  ],
  6: [
    { name: '2-3-1', lines: [2, 3, 1] },
    { name: '3-2-1', lines: [3, 2, 1] },
    { name: '2-1-2-1', lines: [2, 1, 2, 1] },
    { name: '1-3-2', lines: [1, 3, 2] }
  ],
  7: [
    { name: '2-3-2', lines: [2, 3, 2] },
    { name: '3-3-1', lines: [3, 3, 1] },
    { name: '2-2-2-1', lines: [2, 2, 2, 1] },
    { name: '3-2-2', lines: [3, 2, 2] }
  ],
  8: [
    { name: '3-3-2', lines: [3, 3, 2] },
    { name: '3-2-3', lines: [3, 2, 3] },
    { name: '2-3-2-1', lines: [2, 3, 2, 1] },
    { name: '4-3-1', lines: [4, 3, 1] }
  ],
  9: [
    { name: '4-3-2', lines: [4, 3, 2] },
    { name: '3-4-2', lines: [3, 4, 2] },
    { name: '4-4-1', lines: [4, 4, 1] },
    { name: '3-3-3', lines: [3, 3, 3] }
  ],
  10: [
    { name: '4-4-2', lines: [4, 4, 2] },
    { name: '4-3-3', lines: [4, 3, 3] },
    { name: '3-5-2', lines: [3, 5, 2] },
    { name: '4-2-3-1', lines: [4, 2, 3, 1] }
  ]
};

// Storage key for localStorage
var STORAGE_KEY = 'football-tactics-board-saves';
