# Diagram Types Reference

Detailed guidance for each supported diagram type: what to extract, how to lay it out, and element count limits.

---

## Diagram Type Selection

| User Intent | Diagram Type | Example Keywords |
|-------------|--------------|------------------|
| Process flow, steps, procedures | **Flowchart** | "workflow", "process", "steps", "procedure" |
| Connections, dependencies | **Relationship Diagram** | "relationship", "connections", "dependencies" |
| Concept hierarchy, brainstorming | **Mind Map** | "mind map", "concepts", "ideas", "breakdown" |
| System design, components | **Architecture Diagram** | "architecture", "system", "components", "modules" |
| Data flow, transformation | **Data Flow Diagram** | "data flow", "data processing", "transformation" |
| Cross-functional processes | **Swimlane (Business Flow)** | "business process", "swimlane", "actors" |
| Object-oriented design | **Class Diagram** | "class", "inheritance", "OOP", "object model" |
| Interaction sequences | **Sequence Diagram** | "sequence", "interaction", "messages", "timeline" |
| Database design | **ER Diagram** | "database", "entity", "data model", "schema" |

---

## Element Count Guidelines

| Diagram Type | Recommended | Maximum |
|--------------|-------------|---------|
| Flowchart steps | 3-10 | 15 |
| Relationship entities | 3-8 | 12 |
| Mind map branches | 4-6 | 8 |
| Mind map sub-topics/branch | 2-4 | 6 |
| Architecture components | 4-8 | 15 |
| Sequence diagram actors | 2-5 | 8 |
| ER diagram entities | 3-8 | 12 |

If element count exceeds the maximum, suggest splitting into multiple diagrams.

---

## Per-Type Extraction and Layout

### Flowcharts

**Extract:** Sequential steps, decision points, start/end points.

**Layout:** Vertical top-to-bottom flow. Rectangles for steps, diamonds for decisions. Horizontal gap 200-300px, vertical gap 100-150px.

**Colors:** Light green (`#b2f2bb`) for steps, yellow (`#ffd43b`) for decisions, light blue (`#a5d8ff`) for start/end.

### Relationship Diagrams

**Extract:** Entities (name + optional description), relationships (from -> to with label).

**Layout:** Grid layout. Calculate columns = ceil(sqrt(entityCount)). Position:
```
x = startX + (index % columns) * horizontalGap
y = startY + floor(index / columns) * verticalGap
```

**Colors:** Light blue (`#a5d8ff`) for entities. Use arrows with text labels for relationships.

### Mind Maps

**Extract:** Central topic, 3-6 main branches, optional sub-topics per branch (2-4 each).

**Layout:** Radial layout. Central topic at center, branches positioned around it:
```
angle = (2 * PI * index) / branchCount
x = centerX + radius * cos(angle)
y = centerY + radius * sin(angle)
```

**Colors:** Yellow (`#ffd43b`) for central topic, cyan (`#96f2d7`) for branches.

### Architecture Diagrams

**Extract:** Components, connections, data flow direction (left-to-right or top-to-bottom).

**Layout:** Vertical flow with zone backgrounds. See the main SKILL.md layout patterns (Vertical Flow, Horizontal Pipeline, Hub and Spoke).

**Colors:** Use the component-type color palette from `colors.md` (blue=frontend, purple=backend, green=database, etc.).

### Data Flow Diagrams (DFD)

**Extract:** External entities (data sources/destinations), processes (transformations), data stores (databases/files), data flows (arrows).

**Layout:** Three-column structure — left (layer labels), center (flow boxes), right (annotations). See the Data Flow Diagram pattern in the main SKILL.md.

**Note:** Show data flow, not process order.

### Swimlane (Business Flow)

**Extract:** Actors/roles (departments, systems, people), process activities, cross-lane handoffs.

**Layout:** Actors as column headers. Vertical lanes under each actor. Process boxes within lanes. Flow arrows connect boxes including cross-lane connections.

**Spacing:** Lane width 200-300px. Vertical gap between steps 100-150px.

### Class Diagrams

**Extract:**
- Classes with names
- Attributes with visibility (`+` public, `-` private, `#` protected)
- Methods with visibility and parameters
- Relationships: inheritance (solid + white triangle), implementation (dashed + white triangle), association (solid), dependency (dashed), aggregation (white diamond), composition (filled diamond)
- Multiplicity: `1`, `0..1`, `1..*`, `*`

**Layout:** Grid layout. Each class is a rectangle with three sections: name, attributes, methods.

### Sequence Diagrams

**Extract:** Objects/actors (horizontal top row), lifelines (vertical), messages (horizontal arrows between lifelines), synchronous (solid) vs asynchronous (dashed), return values (dashed arrows), activation boxes.

**Layout:** Objects arranged horizontally at top. Lifelines extend vertically. Messages placed top-to-bottom in chronological order. Time flows downward.

**Spacing:** Horizontal gap between actors 200-250px. Vertical gap between messages 60-80px.

### ER Diagrams

**Extract:** Entities (rectangles), attributes (listed inside), primary keys (PK), foreign keys (FK), relationships (connecting lines), cardinality (1:1, 1:N, N:M), junction entities for many-to-many.

**Layout:** Grid layout. Entity rectangles with attribute lists. Relationship lines with cardinality labels.

**Spacing:** Horizontal gap 300-400px between entities. Use junction entities (dashed rectangles) for N:M relationships.

---

## Text Width Estimation

For file-based mode, estimate element width from text content:

```
width = text.length * fontSize * 0.6
height = fontSize * 1.2 * numberOfLines
```

### Font Size by Role

| Role | Size (px) |
|------|-----------|
| Title | 28-36 |
| Section heading | 24-28 |
| Label | 18-22 |
| Annotation | 14-16 |
| Note | 12-14 |

---

## Templates

Pre-built `.excalidraw` template files are available in `templates/`:

| Template | Use Case |
|----------|----------|
| `flowchart-template.excalidraw` | Sequential process flows |
| `relationship-template.excalidraw` | Entity relationships |
| `mindmap-template.excalidraw` | Concept hierarchies |
| `class-diagram-template.excalidraw` | OOP class structures |
| `sequence-diagram-template.excalidraw` | Object interaction timelines |
| `business-flow-swimlane-template.excalidraw` | Cross-functional workflows |
| `data-flow-diagram-template.excalidraw` | Data transformation flows |
| `er-diagram-template.excalidraw` | Database entity relationships |

In MCP mode, use these as reference for layout patterns. In file-based mode, start from a template and modify the elements array.
