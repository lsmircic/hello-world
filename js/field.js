/* ============================================
   Football Tactics Board - Field Rendering
   ============================================ */

var Field = (function () {

  // Compute the field rectangle (the playable area within the canvas)
  function getFieldRect(canvasW, canvasH) {
    var pad = FIELD.padding;
    var x = canvasW * pad;
    var y = canvasH * pad;
    var w = canvasW * (1 - 2 * pad);
    var h = canvasH * (1 - 2 * pad);
    return { x: x, y: y, w: w, h: h };
  }

  // Draw grass with alternating stripes
  function drawGrass(ctx, cw, ch, fr) {
    // Background
    ctx.fillStyle = COLORS.field.grass1;
    ctx.fillRect(0, 0, cw, ch);

    // Alternating stripes
    var stripeCount = 12;
    var stripeW = fr.w / stripeCount;
    ctx.fillStyle = COLORS.field.grass2;
    for (var i = 1; i < stripeCount; i += 2) {
      ctx.fillRect(fr.x + i * stripeW, fr.y, stripeW, fr.h);
    }
  }

  // Draw all pitch markings
  function drawMarkings(ctx, fr) {
    var lw = COLORS.field.lineWidth;
    ctx.strokeStyle = COLORS.field.lines;
    ctx.fillStyle = COLORS.field.lines;
    ctx.lineWidth = lw;

    var x = fr.x, y = fr.y, w = fr.w, h = fr.h;
    var cx = x + w / 2;
    var cy = y + h / 2;

    // Outer boundary
    ctx.strokeRect(x, y, w, h);

    // Halfway line
    ctx.beginPath();
    ctx.moveTo(cx, y);
    ctx.lineTo(cx, y + h);
    ctx.stroke();

    // Center circle
    var ccr = FIELD.centerCircleR * w;
    ctx.beginPath();
    ctx.arc(cx, cy, ccr, 0, Math.PI * 2);
    ctx.stroke();

    // Center spot
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();

    // === Penalty areas (both ends) ===
    var paDepth = FIELD.penaltyAreaDepth * w;
    var paHalfW = (FIELD.penaltyAreaWidth * h) / 2;

    // Left penalty area
    ctx.strokeRect(x, cy - paHalfW, paDepth, paHalfW * 2);
    // Right penalty area
    ctx.strokeRect(x + w - paDepth, cy - paHalfW, paDepth, paHalfW * 2);

    // === Goal areas ===
    var gaDepth = FIELD.goalAreaDepth * w;
    var gaHalfW = (FIELD.goalAreaWidth * h) / 2;

    // Left goal area
    ctx.strokeRect(x, cy - gaHalfW, gaDepth, gaHalfW * 2);
    // Right goal area
    ctx.strokeRect(x + w - gaDepth, cy - gaHalfW, gaDepth, gaHalfW * 2);

    // === Penalty spots ===
    var psDist = FIELD.penaltySpotDist * w;

    ctx.beginPath();
    ctx.arc(x + psDist, cy, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x + w - psDist, cy, 3, 0, Math.PI * 2);
    ctx.fill();

    // === Penalty arcs (outside penalty area) ===
    var parc = FIELD.penaltyArcR * w;

    // Clip to only show arc portions outside the penalty area
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + paDepth, y, w - 2 * paDepth, h);
    ctx.clip();

    ctx.beginPath();
    ctx.arc(x + psDist, cy, parc, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x + w - psDist, cy, parc, Math.PI / 2, -Math.PI / 2);
    ctx.stroke();

    ctx.restore();

    // === Corner arcs ===
    var car = FIELD.cornerArcR * w;
    // Make corner arcs visible
    if (car < 4) car = 4;

    // Top-left
    ctx.beginPath();
    ctx.arc(x, y, car, 0, Math.PI / 2);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.arc(x, y + h, car, -Math.PI / 2, 0);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.arc(x + w, y, car, Math.PI / 2, Math.PI);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.arc(x + w, y + h, car, Math.PI, -Math.PI / 2);
    ctx.stroke();

    // === Goals (behind goal lines) ===
    var goalHalfW = (FIELD.goalWidth * h) / 2;
    var goalDepth = Math.max(FIELD.goalDepth * w, 6);

    ctx.lineWidth = lw + 1;
    ctx.strokeStyle = '#dddddd';

    // Left goal
    ctx.strokeRect(x - goalDepth, cy - goalHalfW, goalDepth, goalHalfW * 2);

    // Right goal
    ctx.strokeRect(x + w, cy - goalHalfW, goalDepth, goalHalfW * 2);

    // Reset
    ctx.strokeStyle = COLORS.field.lines;
    ctx.lineWidth = lw;
  }

  // Main draw function
  function draw(ctx, canvasW, canvasH) {
    var fr = getFieldRect(canvasW, canvasH);
    drawGrass(ctx, canvasW, canvasH, fr);
    drawMarkings(ctx, fr);
    return fr;
  }

  return {
    draw: draw,
    getFieldRect: getFieldRect
  };

})();
