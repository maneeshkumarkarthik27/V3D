# Candidate Vertical Identifier & 3D ULPIN Specification

## Core Identifier Rule
V3D does **not** invent or claim an official Government of India identifier standard.
The official 3D ULPIN standard is currently pending specification from the Department of Land Resources (DoLR), Ministry of Rural Development, Government of India.

The UI strictly distinguishes:
- **Official Status:** `PENDING_GOVERNMENT_SPECIFICATION`
- **Candidate Identifier:** `TN-CH-04-10107-A-F03-U02`
- **Internal Property Volume ID:** `V3D-PROP-007032`

## Composition Scheme
```
[Base Land Identifier] - [Vertical Component] - [Floor Level Code] - [Unit Code]
```
- **Base Land Identifier:** Cadastral parcel root code (e.g. `TN-CH-04-10107`).
- **Vertical Component:**
  - `G`: Ground
  - `A`: Above / Floor
  - `B`: Below / Basement / Underground / Parking
  - `R`: Roof
  - `U`: Utility / Service
  - `C`: Common Area
- **Floor Level Code:** `G00` (Ground), `F01` to `F99` (Above), `B01` to `B09` (Subsurface).
- **Unit Code:** `U01` to `U99`, `COM` (Commercial Suite), `PKG` (Automated Parking).
