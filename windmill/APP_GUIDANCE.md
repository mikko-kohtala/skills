# Windmill App Builder Guide

Complete reference for creating Windmill apps - interactive dashboards and user interfaces.

## What are Windmill Apps?

Windmill apps are the third pillar of the platform (alongside Scripts and Flows). Apps provide user-facing interfaces for internal tools, dashboards, and data applications.

**Key Features:**

- Drag-and-drop UI builder
- Component library (tables, forms, charts, buttons, etc.)
- Connect components to scripts and flows
- Responsive layouts
- Real-time data binding
- Role-based access control

## Workflow

1. Ask user which folder to create the app in (e.g., `f/apps/dashboard/`)
2. Create app folder structure
3. Use `tools/init-app.sh` for interactive scaffolding (recommended), or create manually
4. Design UI in Windmill app editor or define app JSON
5. Deploy with `wmill sync push`

## App Structure

### Folder Organization

```text
f/apps/my_dashboard/
├── app.yaml              # App configuration
└── app.json              # App definition (UI layout, components)
```

### app.yaml (Metadata)

```yaml
summary: "Sales Dashboard"
description: "Real-time sales metrics and reporting"
policy:
  # Access control
  execution_mode: "viewer"
  on_behalf_of: "u/admin"
  on_behalf_of_email: "admin@company.com"
```

### app.json (UI Definition)

```json
{
  "grid": [...],           // Layout grid
  "fullscreen": false,     // Fullscreen mode
  "unusedInlineScripts": [],
  "css": {}                // Custom styling
}
```

## Component Types

### Display Components

**Text**

- Display static or dynamic text
- Markdown support
- Variable interpolation

**Table**

- Display tabular data
- Sorting, filtering, pagination
- Row selection
- Action buttons per row

**Chart**

- Bar, line, pie, scatter plots
- ApexCharts integration
- Real-time data updates

**Display Image**

- Show images from URLs or base64
- Responsive sizing

**Map**

- Geographic data visualization
- Marker support
- Interactive navigation

### Input Components

**Text Input**

- Single-line text entry
- Validation support
- Default values

**Number Input**

- Numeric input with min/max
- Step increments

**Select**

- Dropdown selection
- Single or multi-select
- Dynamic options from scripts

**Checkbox**

- Boolean toggle
- Default checked state

**Date Picker**

- Date/time selection
- Range support
- Format customization

**File Upload**

- File input
- Multiple file support
- Size limits

**Slider**

- Numeric range selection
- Min/max/step configuration

### Action Components

**Button**

- Trigger scripts/flows
- Navigation
- Custom styling
- Loading states

**Form**

- Group inputs together
- Submit to scripts/flows
- Validation

**Tabs**

- Organize content in tabs
- Conditional rendering

**Modal**

- Popup dialogs
- Confirmation prompts
- Forms in overlays

**Stepper**

- Multi-step workflows
- Progress indication

### Container Components

**Container**

- Group components
- Nested layouts
- Conditional visibility

**Horizontal/Vertical Split**

- Split panes
- Resizable dividers

**Drawer**

- Side panel
- Slide-in content

## Data Binding

### Connecting Scripts to Components

**Static Data:**

```json
{
  "componentInput": {
    "type": "static",
    "value": "Hello World"
  }
}
```

**From Script Result:**

```json
{
  "componentInput": {
    "type": "evalv2",
    "expr": "script_a.result",
    "connections": [
      {
        "componentId": "script_a",
        "id": "result"
      }
    ]
  }
}
```

**From Component State:**

```json
{
  "componentInput": {
    "type": "evalv2",
    "expr": "table_1.selectedRow",
    "connections": [
      {
        "componentId": "table_1",
        "id": "selectedRow"
      }
    ]
  }
}
```

### Background Scripts

Apps can have inline background scripts that:

- Fetch data on load
- Poll for updates
- Process data transformations

**Example Background Script:**

```json
{
  "backgroundScripts": {
    "fetch_data": {
      "type": "runnableByName",
      "inlineScript": {
        "content": "export async function main() { return await fetch('/api/data').then(r => r.json()); }",
        "language": "bun"
      },
      "autoRefresh": true,
      "refreshOnStart": true,
      "recomputeOnInputChanged": false
    }
  }
}
```

## Layout System

### Grid System

Apps use a 12-column grid system:

```json
{
  "grid": [
    {
      "id": "header_text",
      "data": {
        "componentInput": {
          "type": "static",
          "value": "# Dashboard"
        },
        "configuration": {}
      },
      "3": { "x": 0, "y": 0, "w": 12, "h": 2 },
      "12": { "x": 0, "y": 0, "w": 12, "h": 2 }
    },
    {
      "id": "table_1",
      "data": {
        "componentInput": {
          "type": "evalv2",
          "expr": "fetch_data.result"
        }
      },
      "3": { "x": 0, "y": 2, "w": 12, "h": 10 },
      "12": { "x": 0, "y": 2, "w": 12, "h": 10 }
    }
  ]
}
```

- `3`: Breakpoint for mobile (3 columns)
- `12`: Breakpoint for desktop (12 columns)
- `x`, `y`: Position in grid
- `w`, `h`: Width and height in grid units

## Common Patterns

### Pattern 1: Data Table with Actions

```json
{
  "grid": [
    {
      "id": "users_table",
      "data": {
        "componentInput": {
          "type": "evalv2",
          "expr": "list_users.result"
        },
        "configuration": {
          "actionButtons": [
            {
              "label": "Edit",
              "id": "edit_button",
              "runnable": {
                "type": "runnableByName",
                "name": "f/scripts/edit_user"
              }
            }
          ]
        }
      }
    }
  ]
}
```

### Pattern 2: Form Submission

```json
{
  "grid": [
    {
      "id": "name_input",
      "data": {
        "componentInput": {
          "type": "static",
          "value": ""
        },
        "configuration": {
          "placeholder": "Enter name"
        }
      }
    },
    {
      "id": "submit_button",
      "data": {
        "configuration": {
          "label": "Submit",
          "runnable": {
            "type": "runnableByName",
            "inlineScript": {
              "content": "export async function main(name: string) { return await saveUser(name); }",
              "language": "bun",
              "path": "inline_script_0"
            },
            "fields": {
              "name": {
                "type": "evalv2",
                "expr": "name_input.result"
              }
            }
          }
        }
      }
    }
  ]
}
```

### Pattern 3: Real-time Dashboard

```json
{
  "backgroundScripts": {
    "poll_metrics": {
      "type": "runnableByName",
      "inlineScript": {
        "content": "export async function main() { return await fetchMetrics(); }",
        "language": "bun"
      },
      "autoRefresh": true,
      "refreshInterval": 5000
    }
  },
  "grid": [
    {
      "id": "metrics_chart",
      "data": {
        "componentInput": {
          "type": "evalv2",
          "expr": "poll_metrics.result"
        }
      }
    }
  ]
}
```

### Pattern 4: Master-Detail View

```json
{
  "grid": [
    {
      "id": "items_table",
      "data": {
        "componentInput": {
          "type": "evalv2",
          "expr": "list_items.result"
        }
      }
    },
    {
      "id": "detail_panel",
      "data": {
        "componentInput": {
          "type": "evalv2",
          "expr": "items_table.selectedRow",
          "connections": [
            {
              "componentId": "items_table",
              "id": "selectedRow"
            }
          ]
        }
      }
    }
  ]
}
```

## Styling

### Custom CSS

Apps support custom CSS for styling:

```json
{
  "css": {
    "header_text": {
      "class": "text-blue-600 font-bold",
      "style": "padding: 20px;"
    }
  }
}
```

### Tailwind Classes

Windmill supports Tailwind CSS classes:

- `text-*`: Text color
- `bg-*`: Background color
- `font-*`: Font weight
- `p-*`, `m-*`: Padding, margin
- `border-*`: Border styles

## Best Practices

### App Organization

1. **Logical grouping**: Use containers to group related components
2. **Naming**: Use descriptive component IDs (e.g., `sales_table`, `submit_button`)
3. **Responsive design**: Test both mobile (3-column) and desktop (12-column) layouts
4. **Reusable scripts**: Reference existing scripts instead of inline scripts when possible

### Performance

1. **Lazy loading**: Use auto-refresh only when necessary
2. **Pagination**: For large datasets, implement pagination
3. **Caching**: Use script caching for expensive operations
4. **Debouncing**: Add debounce to frequently triggered actions

### User Experience

1. **Loading states**: Show loading indicators for async operations
2. **Error handling**: Display user-friendly error messages
3. **Validation**: Validate inputs before submission
4. **Confirmation**: Use modals for destructive actions

### Security

1. **Access control**: Use app policies to control execution permissions
2. **Input sanitization**: Validate and sanitize user inputs
3. **Resource scoping**: Limit access to sensitive resources
4. **Audit logs**: Track user actions for compliance

## Testing Apps

### Local Testing

```bash
# Push app to workspace
wmill sync push

# View in Windmill UI
# Navigate to Apps > Select your app
```

### Debugging

1. **Browser console**: Check for JavaScript errors
2. **Network tab**: Inspect script execution
3. **Component inspector**: Use Windmill's built-in debugger
4. **Script testing**: Test inline scripts separately

## Deployment

### Development Workflow

```bash
# 1. Create app structure
mkdir -p f/apps/my_dashboard

# 2. Create app.yaml and app.json

# 3. Push to workspace
wmill sync push

# 4. Edit in UI (optional)
# Make changes in Windmill app editor

# 5. Pull changes back
wmill sync pull
```

### Multi-Environment

```bash
# Push to dev
git checkout develop
wmill sync push

# Promote to prod
git checkout main
git merge develop
wmill sync push
```

## Advanced Features

### Conditional Visibility

Show/hide components based on conditions:

```json
{
  "data": {
    "configuration": {
      "hidden": {
        "type": "evalv2",
        "expr": "role_input.result !== 'admin'"
      }
    }
  }
}
```

### Dynamic Options

Populate selects from script results:

```json
{
  "id": "category_select",
  "data": {
    "configuration": {
      "options": {
        "type": "evalv2",
        "expr": "fetch_categories.result"
      }
    }
  }
}
```

### App State Management

Share state between components:

```json
{
  "state": {
    "selectedUser": null,
    "filters": {}
  }
}
```

## Common Issues

**App not loading:**

- Check app.json syntax is valid JSON
- Verify all referenced scripts exist
- Check browser console for errors

**Components not updating:**

- Verify data binding connections
- Check if background scripts are running
- Inspect component refresh settings

**Layout issues:**

- Test both 3-column and 12-column breakpoints
- Check for overlapping components
- Verify grid coordinates

## Additional Resources

- [Platform Docs](https://www.windmill.dev/docs/apps/app_editor)
- [Component Reference](https://www.windmill.dev/docs/apps/components)
- [App Examples](https://www.windmill.dev/docs/apps/examples)
