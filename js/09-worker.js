// Worker for parallel rectangle search
self.onmessage = function(e) {
    const { coords, edges, startIdx, endIdx, currentBestArea } = e.data;
    
    const n = coords.length;
    
    // Point-in-polygon using ray casting
    function pointInPolygon(px, py) {
        let inside = false;
        for (let i = 0; i < edges.length; i++) {
            const { x1, y1, x2, y2 } = edges[i];
            
            if (y1 === y2) continue; // horizontal edge
            
            const yMin = Math.min(y1, y2);
            const yMax = Math.max(y1, y2);
            
            if (py < yMin || py >= yMax) continue;
            
            const x = x1;
            if (px < x) {
                inside = !inside;
            }
        }
        return inside;
    }
    
    // Check if a point is on a polygon edge
    function isOnPolygonBoundary(px, py) {
        for (const e of edges) {
            const { x1, y1, x2, y2 } = e;
            if (x1 === x2) {
                // Vertical edge
                if (px === x1 && py >= Math.min(y1, y2) && py <= Math.max(y1, y2)) {
                    return true;
                }
            } else {
                // Horizontal edge
                if (py === y1 && px >= Math.min(x1, x2) && px <= Math.max(x1, x2)) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // Check if all edge points of rectangle are inside or on boundary
    function allEdgePointsValid(minX, minY, maxX, maxY) {
        // Bottom and top edges
        for (let x = minX; x <= maxX; x++) {
            if (!isOnPolygonBoundary(x, minY) && !pointInPolygon(x, minY)) {
                return false;
            }
            if (!isOnPolygonBoundary(x, maxY) && !pointInPolygon(x, maxY)) {
                return false;
            }
        }
        // Left and right edges (excluding corners already checked)
        for (let y = minY + 1; y < maxY; y++) {
            if (!isOnPolygonBoundary(minX, y) && !pointInPolygon(minX, y)) {
                return false;
            }
            if (!isOnPolygonBoundary(maxX, y) && !pointInPolygon(maxX, y)) {
                return false;
            }
        }
        return true;
    }
    
    let bestArea = currentBestArea;
    let bestRect = null;
    let processed = 0;
    
    // Process assigned range of i values
    for (let i = startIdx; i < endIdx; i++) {
        for (let j = i + 1; j < n; j++) {
            processed++;
            
            const [x1, y1] = coords[i];
            const [x2, y2] = coords[j];
            
            // Must form a proper rectangle (not a line)
            if (x1 === x2 || y1 === y2) {
                continue;
            }
            
            // Area includes the boundary points (discrete grid)
            const area = (Math.abs(x2 - x1) + 1) * (Math.abs(y2 - y1) + 1);
            if (area <= bestArea) continue;
            
            // Normalize to get bottom-left and top-right
            const minX = Math.min(x1, x2);
            const maxX = Math.max(x1, x2);
            const minY = Math.min(y1, y2);
            const maxY = Math.max(y1, y2);
            
            // Check if all edge points are inside or on boundary
            if (!allEdgePointsValid(minX, minY, maxX, maxY)) {
                continue;
            }

            // This rectangle is fully inside
            bestArea = area;
            bestRect = { x1: minX, y1: minY, x2: maxX, y2: maxY };
        }
    }
    
    self.postMessage({ bestArea, bestRect, processed });
};

