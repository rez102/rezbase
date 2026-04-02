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

function drawRouteSection(points, color, contextLabel, styleOverrides = {}) {
    if (points.length < 2) {
        return;
    }

    try {
        const lineOptions = {
            color,
            weight: 4,
            opacity: 0.8,
            ...styleOverrides
        };
        const polyline = L.polyline(points, lineOptions).addTo(map);
        routePolylines.push(polyline);
        if (typeof styleOverrides.onClick === 'function') {
            polyline.on('click', styleOverrides.onClick);
        }

        if (L.polylineDecorator && L.Symbol && typeof L.Symbol.arrowHead === 'function') {
            const arrowPixelSize = styleOverrides.arrowPixelSize || 10;
            const arrowRepeat = styleOverrides.arrowRepeat || '120px';
            const arrowOffset = styleOverrides.arrowOffset || '30%';
            const decorator = L.polylineDecorator(polyline, {
                patterns: [
                    {
                        offset: arrowOffset,
                        repeat: arrowRepeat,
                        symbol: L.Symbol.arrowHead({
                            pixelSize: arrowPixelSize,
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
        const sectionOptions = {};
        if (currentRouteView === 'create') {
            sectionOptions.onClick = () => {
                const sectionName = section && typeof section.name === 'string' && section.name.trim()
                    ? section.name.trim()
                    : `区間${sectionIndex + 1}`;
                showToast(sectionName, 'info');
            };
        }
        drawRouteSection(sectionPoints, getSectionColor(sectionIndex), 'route-visuals', sectionOptions);
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
