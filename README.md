# V3D — Tamil Nadu 3D Land, Property & Infrastructure Digital Twin

**SIH Problem Statement:** SIH26011 — 3D ULPIN Generation and Vertical Property Mapping System  
**Target Domain:** Tamil Nadu 3D Land + Property + Infrastructure Mapping Platform  

---

## 1. Overview

V3D is a geospatial 3D digital twin platform that transforms traditional 2D land cadastral parcels into volumetric, multi-tier spatial property volumes. It bridges above-ground structural envelopes, vertical floor semantics, subterranean basements, and critical underground utilities (Chennai Metro Rail tunnels, water mains, drainage, sewerage, electricity, and telecommunications).

### Key Architectural Pillars:
1. **Real Tamil Nadu Cadastral Context:** Multi-level administrative hierarchy (Tamil Nadu → District → Taluk → Project Area → Land Parcel → Building → Floor → Unit).
2. **Candidate Vertical ULPIN Composer:** Generates structured prototype vertical identifiers while strictly acknowledging official 3D ULPIN specifications as pending from the Department of Land Resources (DoLR), Government of India.
3. **True 3D vs. 2D Collision Engine:** Mathematical differentiation between innocuous 2D footprint overlaps and genuine 3D subterranean structural clashes (e.g., Metro tunnels penetrating private basement volumes).
4. **Blueprint-to-3D Extrusion Studio:** Vectorized architectural floorplan parsing with AI-assisted wall, room, door, and window recognition, translating 2D CAD into 3D multi-level property models.
5. **Municipal Tax & Policy Rules Engine:** Algorithmic property tax estimation coupled with statutory Tamil Nadu Combined Development and Building Rules (TNCDBR 2019) and Chennai Metro Rail Limited (CMRL) protection protocols.
6. **Data Provenance & RBAC:** Complete lineage tracking (LiDAR, DEM, GNSS, Cadastre, AI) with strict separation between verified authorized datasets and synthetic demonstration records.

---

## 2. Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Three.js, Lucide Icons, Canvas Confetti.
- **Backend:** Node.js, Express, REST APIs, Vite Middleware.
- **Coordinate Reference Systems (CRS):** EPSG:32644 (UTM Zone 44N Metric Grid) + EPSG:4326 (WGS84).
- **Subsurface Z-Datum:** Mean Sea Level (MSL) with metric subterranean depth coordinates.

---

## 3. Quick Start

```bash
# Run full-stack development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```
The application will be accessible at port `3000`.
