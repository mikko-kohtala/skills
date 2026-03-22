#!/usr/bin/env bash
set -euo pipefail

# Windmill App Scaffolding Tool
# Interactive wizard to create new Windmill apps with proper structure

echo "=== Windmill App Scaffolding Wizard ==="
echo

# Check if we're in a Windmill project
if [[ ! -f "wmill.yaml" ]]; then
    echo "Error: Not in a Windmill project directory (wmill.yaml not found)"
    echo "Run 'wmill init' first or navigate to your Windmill project root"
    exit 1
fi

# App template selection
echo "Select app template:"
echo "  1) Simple Dashboard - Basic data display with table"
echo "  2) Form App - Input form with submission"
echo "  3) Admin Panel - CRUD operations interface"
echo "  4) Real-time Dashboard - Live data with auto-refresh"
echo "  5) Master-Detail View - List with detail panel"
echo "  6) Blank App - Empty app to start from scratch"
echo
read -p "Choice (1-6): " template_choice

case "$template_choice" in
    1) template="dashboard" ;;
    2) template="form" ;;
    3) template="admin" ;;
    4) template="realtime" ;;
    5) template="master_detail" ;;
    6) template="blank" ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

# Folder path
echo
read -p "Enter folder path (e.g., f/apps/dashboard or f/apps/admin): " folder_path

# Normalize folder path
folder_path="${folder_path%/}"  # Remove trailing slash if present

# App name
echo
read -p "Enter app name (e.g., sales_dashboard or user_admin): " app_name

# Full path
app_path="${folder_path}/${app_name}"

# Check if directory already exists
if [[ -d "$app_path" ]]; then
    read -p "Directory $app_path already exists. Overwrite? (y/N): " overwrite
    if [[ "$overwrite" != "y" && "$overwrite" != "Y" ]]; then
        echo "Aborted"
        exit 0
    fi
    rm -rf "$app_path"
fi

# Create directory
mkdir -p "$app_path"

# Generate app.yaml
cat > "$app_path/app.yaml" <<EOF
summary: "${app_name}"
description: "Windmill app: ${app_name}"
policy:
  execution_mode: "viewer"
  on_behalf_of: ""
  on_behalf_of_email: ""
EOF

# Generate app.json based on template
case "$template" in
    dashboard)
        cat > "$app_path/app.json" <<'EOF'
{
  "grid": [
    {
      "id": "header",
      "data": {
        "componentInput": {
          "type": "static",
          "value": "# Dashboard",
          "fieldType": "text"
        },
        "configuration": {}
      },
      "3": { "x": 0, "y": 0, "w": 12, "h": 2 },
      "12": { "x": 0, "y": 0, "w": 12, "h": 2 }
    },
    {
      "id": "data_table",
      "data": {
        "componentInput": {
          "type": "evalv2",
          "expr": "fetch_data.result",
          "connections": [
            {
              "componentId": "fetch_data",
              "id": "result"
            }
          ],
          "fieldType": "array"
        },
        "configuration": {
          "search": "Disabled",
          "pagination": {
            "auto": true,
            "pageSize": 20
          }
        }
      },
      "3": { "x": 0, "y": 2, "w": 12, "h": 12 },
      "12": { "x": 0, "y": 2, "w": 12, "h": 12 }
    }
  ],
  "fullscreen": false,
  "unusedInlineScripts": [],
  "hiddenInlineScripts": [],
  "css": {},
  "norefreshbar": false,
  "workspace": null,
  "backgroundScripts": {
    "fetch_data": {
      "type": "runnableByName",
      "name": null,
      "inlineScript": {
        "content": "export async function main() {\n  // Fetch your data here\n  return [\n    { id: 1, name: 'Item 1', value: 100 },\n    { id: 2, name: 'Item 2', value: 200 },\n    { id: 3, name: 'Item 3', value: 300 }\n  ];\n}",
        "language": "bun",
        "path": "fetch_data"
      },
      "autoRefresh": true,
      "refreshOnStart": true,
      "recomputeOnInputChanged": false
    }
  }
}
EOF
        ;;

    form)
        cat > "$app_path/app.json" <<'EOF'
{
  "grid": [
    {
      "id": "form_title",
      "data": {
        "componentInput": {
          "type": "static",
          "value": "# Submit Form",
          "fieldType": "text"
        },
        "configuration": {}
      },
      "3": { "x": 0, "y": 0, "w": 12, "h": 2 },
      "12": { "x": 0, "y": 0, "w": 12, "h": 2 }
    },
    {
      "id": "name_input",
      "data": {
        "componentInput": {
          "type": "static",
          "value": "",
          "fieldType": "text"
        },
        "configuration": {
          "placeholder": "Enter name"
        }
      },
      "3": { "x": 0, "y": 2, "w": 12, "h": 3 },
      "12": { "x": 0, "y": 2, "w": 6, "h": 3 }
    },
    {
      "id": "email_input",
      "data": {
        "componentInput": {
          "type": "static",
          "value": "",
          "fieldType": "text"
        },
        "configuration": {
          "placeholder": "Enter email"
        }
      },
      "3": { "x": 0, "y": 5, "w": 12, "h": 3 },
      "12": { "x": 6, "y": 2, "w": 6, "h": 3 }
    },
    {
      "id": "submit_button",
      "data": {
        "componentInput": {},
        "configuration": {
          "label": "Submit",
          "onSuccess": {
            "type": "gotoUrl",
            "url": "#"
          },
          "runnable": {
            "type": "runnableByName",
            "name": null,
            "inlineScript": {
              "content": "export async function main(name: string, email: string) {\n  // Process form submission\n  console.log('Submitted:', { name, email });\n  return { success: true, message: 'Form submitted successfully' };\n}",
              "language": "bun",
              "path": "submit_form"
            },
            "fields": {
              "name": {
                "type": "evalv2",
                "expr": "name_input.result",
                "connections": [{ "componentId": "name_input", "id": "result" }]
              },
              "email": {
                "type": "evalv2",
                "expr": "email_input.result",
                "connections": [{ "componentId": "email_input", "id": "result" }]
              }
            }
          }
        }
      },
      "3": { "x": 0, "y": 8, "w": 12, "h": 3 },
      "12": { "x": 0, "y": 5, "w": 12, "h": 3 }
    }
  ],
  "fullscreen": false,
  "unusedInlineScripts": [],
  "hiddenInlineScripts": [],
  "css": {},
  "norefreshbar": false
}
EOF
        ;;

    admin)
        cat > "$app_path/app.json" <<'EOF'
{
  "grid": [
    {
      "id": "title",
      "data": {
        "componentInput": {
          "type": "static",
          "value": "# Admin Panel",
          "fieldType": "text"
        },
        "configuration": {}
      },
      "3": { "x": 0, "y": 0, "w": 12, "h": 2 },
      "12": { "x": 0, "y": 0, "w": 12, "h": 2 }
    },
    {
      "id": "items_table",
      "data": {
        "componentInput": {
          "type": "evalv2",
          "expr": "list_items.result",
          "connections": [{ "componentId": "list_items", "id": "result" }],
          "fieldType": "array"
        },
        "configuration": {
          "actionButtons": [
            {
              "label": "Edit",
              "id": "edit_btn",
              "runnable": {
                "type": "runnableByName",
                "inlineScript": {
                  "content": "export async function main(item: any) {\n  console.log('Edit:', item);\n  // Edit logic here\n}",
                  "language": "bun",
                  "path": "edit_item"
                }
              }
            },
            {
              "label": "Delete",
              "id": "delete_btn",
              "runnable": {
                "type": "runnableByName",
                "inlineScript": {
                  "content": "export async function main(item: any) {\n  console.log('Delete:', item);\n  // Delete logic here\n}",
                  "language": "bun",
                  "path": "delete_item"
                }
              }
            }
          ]
        }
      },
      "3": { "x": 0, "y": 2, "w": 12, "h": 12 },
      "12": { "x": 0, "y": 2, "w": 12, "h": 12 }
    }
  ],
  "fullscreen": false,
  "unusedInlineScripts": [],
  "hiddenInlineScripts": [],
  "css": {},
  "backgroundScripts": {
    "list_items": {
      "type": "runnableByName",
      "inlineScript": {
        "content": "export async function main() {\n  // Fetch items from database\n  return [\n    { id: 1, name: 'Item 1', status: 'active' },\n    { id: 2, name: 'Item 2', status: 'inactive' }\n  ];\n}",
        "language": "bun",
        "path": "list_items"
      },
      "autoRefresh": false,
      "refreshOnStart": true
    }
  }
}
EOF
        ;;

    realtime)
        cat > "$app_path/app.json" <<'EOF'
{
  "grid": [
    {
      "id": "title",
      "data": {
        "componentInput": {
          "type": "static",
          "value": "# Real-time Dashboard",
          "fieldType": "text"
        },
        "configuration": {}
      },
      "3": { "x": 0, "y": 0, "w": 12, "h": 2 },
      "12": { "x": 0, "y": 0, "w": 12, "h": 2 }
    },
    {
      "id": "metrics_display",
      "data": {
        "componentInput": {
          "type": "evalv2",
          "expr": "poll_metrics.result",
          "connections": [{ "componentId": "poll_metrics", "id": "result" }],
          "fieldType": "object"
        },
        "configuration": {}
      },
      "3": { "x": 0, "y": 2, "w": 12, "h": 10 },
      "12": { "x": 0, "y": 2, "w": 12, "h": 10 }
    }
  ],
  "fullscreen": false,
  "unusedInlineScripts": [],
  "hiddenInlineScripts": [],
  "css": {},
  "backgroundScripts": {
    "poll_metrics": {
      "type": "runnableByName",
      "inlineScript": {
        "content": "export async function main() {\n  // Fetch real-time metrics\n  return {\n    timestamp: new Date().toISOString(),\n    value: Math.random() * 100,\n    status: 'healthy'\n  };\n}",
        "language": "bun",
        "path": "poll_metrics"
      },
      "autoRefresh": true,
      "refreshInterval": 5000,
      "refreshOnStart": true
    }
  }
}
EOF
        ;;

    master_detail)
        cat > "$app_path/app.json" <<'EOF'
{
  "grid": [
    {
      "id": "title",
      "data": {
        "componentInput": {
          "type": "static",
          "value": "# Master-Detail View",
          "fieldType": "text"
        },
        "configuration": {}
      },
      "3": { "x": 0, "y": 0, "w": 12, "h": 2 },
      "12": { "x": 0, "y": 0, "w": 12, "h": 2 }
    },
    {
      "id": "items_list",
      "data": {
        "componentInput": {
          "type": "evalv2",
          "expr": "fetch_items.result",
          "connections": [{ "componentId": "fetch_items", "id": "result" }],
          "fieldType": "array"
        },
        "configuration": {}
      },
      "3": { "x": 0, "y": 2, "w": 12, "h": 12 },
      "12": { "x": 0, "y": 2, "w": 6, "h": 12 }
    },
    {
      "id": "detail_panel",
      "data": {
        "componentInput": {
          "type": "evalv2",
          "expr": "items_list.selectedRow",
          "connections": [{ "componentId": "items_list", "id": "selectedRow" }],
          "fieldType": "object"
        },
        "configuration": {}
      },
      "3": { "x": 0, "y": 14, "w": 12, "h": 10 },
      "12": { "x": 6, "y": 2, "w": 6, "h": 12 }
    }
  ],
  "fullscreen": false,
  "unusedInlineScripts": [],
  "hiddenInlineScripts": [],
  "css": {},
  "backgroundScripts": {
    "fetch_items": {
      "type": "runnableByName",
      "inlineScript": {
        "content": "export async function main() {\n  return [\n    { id: 1, title: 'Item 1', description: 'Details for item 1' },\n    { id: 2, title: 'Item 2', description: 'Details for item 2' },\n    { id: 3, title: 'Item 3', description: 'Details for item 3' }\n  ];\n}",
        "language": "bun",
        "path": "fetch_items"
      },
      "autoRefresh": false,
      "refreshOnStart": true
    }
  }
}
EOF
        ;;

    blank)
        cat > "$app_path/app.json" <<'EOF'
{
  "grid": [],
  "fullscreen": false,
  "unusedInlineScripts": [],
  "hiddenInlineScripts": [],
  "css": {},
  "norefreshbar": false,
  "backgroundScripts": {}
}
EOF
        ;;
esac

echo
echo "✓ Created app: $app_path"
echo "  - app.yaml"
echo "  - app.json"
echo

# Ask if user wants to push to workspace
read -p "Push app to workspace? (Y/n): " push
if [[ "$push" != "n" && "$push" != "N" ]]; then
    echo
    echo "Running: wmill sync push"
    if wmill sync push; then
        echo "✓ App pushed successfully"
    else
        echo "⚠ Push failed - check wmill configuration"
        exit 1
    fi
fi

echo
echo "=== Next Steps ==="
echo "1. Edit the app in Windmill UI:"
echo "   - Navigate to Apps > ${app_name}"
echo "   - Use the visual app editor"
echo "2. Or edit locally: $app_path/app.json"
echo "3. Pull changes back: wmill sync pull"
echo

# Ask if user wants to open the file
if command -v code &> /dev/null; then
    read -p "Open app.json in VS Code? (y/N): " open_code
    if [[ "$open_code" == "y" || "$open_code" == "Y" ]]; then
        code "$app_path/app.json"
    fi
fi
