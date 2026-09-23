# V3D System Architecture

## Architectural Philosophy
The core principle governing V3D is:
```
2D LAND
   +
BUILDING GEOMETRY
   +
FLOOR SEMANTICS
   +
VERTICAL Z-COORDINATES
   +
PROPERTY UNITS
   +
UNDERGROUND INFRASTRUCTURE
   +
OWNERSHIP / AUTHORIZED PROPERTY DATA
   +
TAX INFORMATION
   +
POLICY RULES
   +
TOPOLOGY VALIDATION
   +
DATA PROVENANCE
   ↓
3D SPATIAL PROPERTY DIGITAL TWIN
   ↓
CANDIDATE VERTICAL IDENTIFIER
   ↓
FUTURE OFFICIAL 3D ULPIN INTEGRATION
```

## System Modules
1. **Tamil Nadu Geographic Service:** Provides district boundaries, local taluks, and project areas (e.g., Chennai Taramani OMR, Anna Nagar, Guindy).
2. **Three.js Digital Twin Engine:** Renders cadastral boundaries, multi-level extruded building slabs, translucent terrain, underground utilities, and animated clipping planes.
3. **Candidate Identifier Service:** Deconstructs vertical spatial coordinates into Base Land ID + Vertical Semantic + Floor Level + Unit Code.
4. **Topology Validation Engine:** Evaluates 3D bounding box overlaps in metric space (EPSG:32644) to identify clashes between infrastructure and private subterranean structures.
5. **Blueprint Extruder:** Parses floorplans (SVG, DXF, GeoJSON) into discrete room geometries, extruding multi-story towers with assigned vertical identifiers.
