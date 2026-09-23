# 3-Minute Evaluator Demonstration Guide

This guide walks an evaluator through the core capabilities of V3D in approximately 3 minutes:

1. **Tamil Nadu Geographic Navigation:**
   - Open **Tamil Nadu GIS** map tab.
   - Select **Chennai** District and the **Taramani OMR Tech & Metro Hub** project sector.
   - Observe real/open geographic context paired with cadastral parcel boundaries.

2. **3D Cadastral Digital Twin:**
   - Switch to **3D Twin** view.
   - Select **Parcel P-007** (Apex IT Tech Tower).
   - Observe the 3D building standing within its cadastral bounds.

3. **Exploded Vertical Floor System:**
   - Drag the **Explode View** slider in the right panel from 0m to 4.5m.
   - Watch the individual floors separate vertically into the sky.
   - Click on **Floor 3** and inspect **Suite 02**.

4. **Candidate Vertical Identifier:**
   - In the right-hand panel, inspect the **Candidate Identifier**: `TN-CH-04-10107-A-F03-U02`.
   - Note the clear disclaimer: *"Official 3D ULPIN: Pending Government Specification"*.
   - Copy the identifier string to clipboard with one click.

5. **Subsurface Metro & Underground Utilities:**
   - Switch to the **Metro & Subsurface** tab or toggle **Translucent Ground** on.
   - Notice the cylindrical **Chennai Metro Line 4 Tunnel** at depth Z: -16.5m.
   - Inspect the **Taramani Underground Metro Station** with concourse (-8m), platform (-16m), and 4 surface access portals.
   - Observe color-coded water transmission mains (-4.5m), sewer lines (-8.2m), and electrical feeder banks (-2.4m).

6. **Automated 3D Topology Clash Detection:**
   - Navigate to **3D Validation** tab.
   - Click on **VAL-001: Metro Tunnel vs. Basement -2 Intersection**.
   - Watch the 3D camera fly directly to the subsurface coordinate `[120, -8.2, -45]`, highlighting the glowing red collision zone where the building basement intrudes into the CMRL exclusion envelope.

7. **Blueprint to 3D Extrusion:**
   - Navigate to **Blueprint → 3D** tab.
   - Inspect the uploaded floorplan with AI-detected walls, rooms, doors, and windows.
   - Adjust floor count to 5 and click **Generate 3D Building Volume**.
   - The system vectorizes the plan, extrudes the vertical volumes, and positions the new building directly inside the 3D digital twin.

8. **Tax Assessment & Building Policies:**
   - Open **Tax & Policy** tab.
   - Run the prototype tax estimator (formula breakdown) and review active **TNCDBR 2019** and **CMRL Subsurface Influence Zone** regulations.

9. **Export Cadastral Dossier:**
   - Click **Download Property Template** in JSON or CSV format.
   - Conclude with the system state: *"Volumetric property model generated."*
