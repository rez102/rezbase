// Route line rendering and preview logic.

function buildSectionRoutePoints(section, route) {
    if (!section || !Array.isArray(section.pins)) {
        return [];
    }

    const points = [];
    section.pins.forEach(pinId => {
        const pinMeta = getRoutePinMeta(pinId, route);
        if (!pinMeta || !pinMeta.latlng) return;

        const latlng = pinMeta.latlng;
        if (points.length === 0 || !points[points.length - 1].equals(latlng)) {
            points.push(latlng);
        }
    });

    return points;
}

function drawRouteSection(points, color, contextLabel) {
    if (points.length < 2) {
        return;
    }

    try {
        const polyline = L.polyline(points, { color, weight: 4, opacity: 0.8 }).addTo(map);
        routePolylines.push(polyline);

        if (L.polylineDecorator && L.Symbol && typeof L.Symbol.arrowHead === 'function') {
            const decorator = L.polylineDecorator(polyline, {
                patterns: [
                    {
                        offset: '30%',
                        repeat: '120px',
                        symbol: L.Symbol.arrowHead({
                            pixelSize: 10,
                            polygon: true,
                            pathOptions: { color, fillColor: color, weight: 1, opacity: 1, fillOpacity: 1 }
                        })
                    }
                ]
            }).addTo(map);
            routeDecorators.push(decorator);
        } else {
            console.warn(`[${contextLabel}] polyline decorator is not available. Arrow display is disabled.`);
        }
    } catch (error) {
        console.error(`[${contextLabel}] Error drawing route section`, error);
    }
}

function renderRouteSections(route, { highlightIndex = -1 } = {}) {
    if (!route || !Array.isArray(route.sections)) {
        return false;
    }

    route.sections.forEach((section, sectionIndex) => {
        if (highlightIndex !== -1 && highlightIndex !== sectionIndex) return;

        const sectionMapMode = getSectionMapMode(section, route);
        if (sectionMapMode && sectionMapMode !== mapOverlayMode) {
            return;
        }

        const sectionPoints = buildSectionRoutePoints(section, route);
        drawRouteSection(sectionPoints, getSectionColor(sectionIndex), 'route-visuals');
    });

    renderRouteScopedCustomPins(route);
    return true;
}

function renderRouteOnMap(route, highlightIndex = -1, disableAutoZoom = false) {
    if (!route || !Array.isArray(route.sections)) return;

    clearRouteVisuals();
    renderRouteSections(route, { highlightIndex });

    if (routePolylines.length > 0 && !disableAutoZoom) {
        const routePolylineGroup = new L.featureGroup(routePolylines);
        map.fitBounds(routePolylineGroup.getBounds().pad(0.2), getRouteZoomOptions());
    }
}

function getSectionMapMode(section, route = null) {
    if (!section || !section.pins || !Array.isArray(section.pins)) return mapOverlayMode;
    for (const pinId of section.pins) {
        const pinMeta = getRoutePinMeta(pinId, route);
        if (pinMeta && pinMeta.map) return pinMeta.map;
    }
    return 'base';
}

function showRoutePreview(route) {
    if (!route || !Array.isArray(route.sections)) {
        console.error('[route-preview] Invalid route data:', route);
        return;
    }

    clearRouteVisuals();
    renderRouteSections(route);
}
