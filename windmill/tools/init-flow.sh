#!/usr/bin/env bash
set -euo pipefail

# Windmill Flow Scaffolding Tool
# Interactive wizard to create new Windmill flows with proper OpenFlow structure

echo "=== Windmill Flow Scaffolding Wizard ==="
echo

# Check if we're in a Windmill project
if [[ ! -f "wmill.yaml" ]]; then
    echo "Error: Not in a Windmill project directory (wmill.yaml not found)"
    echo "Run 'wmill init' first or navigate to your Windmill project root"
    exit 1
fi

# Template selection
echo "Select flow template:"
echo "  1) Simple Sequential - Chain steps together"
echo "  2) Conditional Branch - Different paths based on conditions"
echo "  3) Parallel Processing - Process items concurrently"
echo "  4) API Integration - Fetch, transform, store pattern"
echo "  5) Approval Workflow - Human approval step"
echo "  6) Empty Flow - Start from scratch"
echo
read -p "Choice (1-6): " template_choice

# Folder path
echo
read -p "Enter folder path (e.g., f/workflows/data or f/flows/user_management): " folder_path

# Normalize and add .flow suffix
folder_path="${folder_path%/}"  # Remove trailing slash
if [[ ! "$folder_path" =~ \.flow$ ]]; then
    folder_path="${folder_path}.flow"
fi

# Flow name (derived from folder)
flow_name=$(basename "$folder_path" .flow)

# Check if folder already exists
if [[ -d "$folder_path" ]]; then
    read -p "Folder $folder_path already exists. Continue? (y/N): " continue
    if [[ "$continue" != "y" && "$continue" != "Y" ]]; then
        echo "Aborted"
        exit 0
    fi
fi

# Create directory
mkdir -p "$folder_path"

# Generate flow.yaml and inline scripts based on template
case "$template_choice" in
    1)
        # Simple Sequential Flow
        cat > "$folder_path/flow.yaml" <<'EOF'
summary: "Simple sequential workflow"
description: "Process data through multiple steps"
value:
  modules:
    - id: step1
      value:
        type: rawscript
        content: '!inline step1.ts'
        language: bun
        input_transforms:
          input:
            type: javascript
            expr: "flow_input.data"

    - id: step2
      value:
        type: rawscript
        content: '!inline step2.ts'
        language: bun
        input_transforms:
          previous_result:
            type: javascript
            expr: "results.step1"

    - id: step3
      value:
        type: rawscript
        content: '!inline step3.ts'
        language: bun
        input_transforms:
          previous_result:
            type: javascript
            expr: "results.step2"

schema:
  type: object
  properties:
    data:
      type: string
      description: "Input data to process"
  required: ["data"]
EOF

        cat > "$folder_path/step1.ts" <<'EOF'
export async function main(input: string) {
  console.log("Step 1: Processing input:", input)
  return {
    processed: input.toUpperCase(),
    timestamp: new Date().toISOString()
  }
}
EOF

        cat > "$folder_path/step2.ts" <<'EOF'
export async function main(previous_result: any) {
  console.log("Step 2: Transforming result")
  return {
    ...previous_result,
    transformed: true,
    length: previous_result.processed.length
  }
}
EOF

        cat > "$folder_path/step3.ts" <<'EOF'
export async function main(previous_result: any) {
  console.log("Step 3: Final processing")
  return {
    success: true,
    final_result: previous_result
  }
}
EOF
        ;;

    2)
        # Conditional Branch Flow
        cat > "$folder_path/flow.yaml" <<'EOF'
summary: "Conditional branch workflow"
description: "Different paths based on conditions"
value:
  modules:
    - id: check_input
      value:
        type: rawscript
        content: '!inline check_input.ts'
        language: bun
        input_transforms:
          value:
            type: javascript
            expr: "flow_input.value"

    - id: conditional_branch
      value:
        type: branchone
        branches:
          - summary: "High value path"
            expr: "results.check_input.value > 100"
            modules:
              - id: high_value_handler
                value:
                  type: rawscript
                  content: '!inline high_value.ts'
                  language: bun
                  input_transforms:
                    value:
                      type: javascript
                      expr: "results.check_input.value"

          - summary: "Low value path"
            expr: "results.check_input.value <= 100"
            modules:
              - id: low_value_handler
                value:
                  type: rawscript
                  content: '!inline low_value.ts'
                  language: bun
                  input_transforms:
                    value:
                      type: javascript
                      expr: "results.check_input.value"

schema:
  type: object
  properties:
    value:
      type: number
      description: "Value to check"
  required: ["value"]
EOF

        cat > "$folder_path/check_input.ts" <<'EOF'
export async function main(value: number) {
  console.log("Checking value:", value)
  return { value, valid: true }
}
EOF

        cat > "$folder_path/high_value.ts" <<'EOF'
export async function main(value: number) {
  console.log("High value path:", value)
  return {
    path: "high",
    value,
    message: "Processing high value"
  }
}
EOF

        cat > "$folder_path/low_value.ts" <<'EOF'
export async function main(value: number) {
  console.log("Low value path:", value)
  return {
    path: "low",
    value,
    message: "Processing low value"
  }
}
EOF
        ;;

    3)
        # Parallel Processing Flow
        cat > "$folder_path/flow.yaml" <<'EOF'
summary: "Parallel processing workflow"
description: "Process multiple items concurrently"
value:
  modules:
    - id: prepare_items
      value:
        type: rawscript
        content: '!inline prepare.ts'
        language: bun
        input_transforms:
          items:
            type: javascript
            expr: "flow_input.items"

    - id: process_loop
      value:
        type: forloopflow
        iterator:
          type: javascript
          expr: "results.prepare_items.items"
        skip_failures: true
        parallel: true
        parallelism: 4
        modules:
          - id: process_item
            value:
              type: rawscript
              content: '!inline process_item.ts'
              language: bun
              input_transforms:
                item:
                  type: javascript
                  expr: "flow_input.iter.value"
                index:
                  type: javascript
                  expr: "flow_input.iter.index"

    - id: aggregate
      value:
        type: rawscript
        content: '!inline aggregate.ts'
        language: bun
        input_transforms:
          results:
            type: javascript
            expr: "results.process_loop"

schema:
  type: object
  properties:
    items:
      type: array
      description: "Items to process"
  required: ["items"]
EOF

        cat > "$folder_path/prepare.ts" <<'EOF'
export async function main(items: any[]) {
  console.log("Preparing items:", items.length)
  return { items }
}
EOF

        cat > "$folder_path/process_item.ts" <<'EOF'
export async function main(item: any, index: number) {
  console.log(`Processing item ${index}:`, item)
  // Simulate processing
  return {
    index,
    item,
    processed: true,
    timestamp: new Date().toISOString()
  }
}
EOF

        cat > "$folder_path/aggregate.ts" <<'EOF'
export async function main(results: any[]) {
  console.log("Aggregating results:", results.length)
  return {
    total: results.length,
    successful: results.filter(r => r.processed).length,
    results
  }
}
EOF
        ;;

    4)
        # API Integration Flow
        cat > "$folder_path/flow.yaml" <<'EOF'
summary: "API integration workflow"
description: "Fetch, transform, and store data from API"
value:
  modules:
    - id: fetch_data
      value:
        type: rawscript
        content: '!inline fetch.ts'
        language: bun
        input_transforms:
          api_url:
            type: javascript
            expr: "flow_input.api_url"

    - id: transform_data
      value:
        type: rawscript
        content: '!inline transform.ts'
        language: bun
        input_transforms:
          data:
            type: javascript
            expr: "results.fetch_data"

    - id: store_data
      value:
        type: rawscript
        content: '!inline store.ts'
        language: bun
        input_transforms:
          transformed_data:
            type: javascript
            expr: "results.transform_data"

schema:
  type: object
  properties:
    api_url:
      type: string
      description: "API endpoint to fetch from"
  required: ["api_url"]
EOF

        cat > "$folder_path/fetch.ts" <<'EOF'
export async function main(api_url: string) {
  console.log("Fetching from:", api_url)
  const response = await fetch(api_url)
  const data = await response.json()
  return data
}
EOF

        cat > "$folder_path/transform.ts" <<'EOF'
export async function main(data: any) {
  console.log("Transforming data")
  // Transform logic here
  return {
    ...data,
    transformed: true,
    timestamp: new Date().toISOString()
  }
}
EOF

        cat > "$folder_path/store.ts" <<'EOF'
export async function main(transformed_data: any) {
  console.log("Storing data")
  // Store logic here (database, file, etc.)
  return {
    success: true,
    stored: transformed_data
  }
}
EOF
        ;;

    5)
        # Approval Workflow
        cat > "$folder_path/flow.yaml" <<'EOF'
summary: "Approval workflow"
description: "Process with human approval step"
value:
  modules:
    - id: prepare_request
      value:
        type: rawscript
        content: '!inline prepare.ts'
        language: bun
        input_transforms:
          request:
            type: javascript
            expr: "flow_input.request"

    - id: request_approval
      value:
        type: rawscript
        content: '!inline approval.ts'
        language: bun
        suspend:
          required_events: 1
          timeout: 86400
          resume_form:
            schema:
              type: object
              properties:
                approved:
                  type: boolean
                  description: "Approve this request?"
                comments:
                  type: string
                  description: "Optional comments"
        input_transforms:
          request:
            type: javascript
            expr: "results.prepare_request"

    - id: process_decision
      value:
        type: rawscript
        content: '!inline process.ts'
        language: bun
        input_transforms:
          request:
            type: javascript
            expr: "results.prepare_request"
          decision:
            type: javascript
            expr: "results.request_approval"

schema:
  type: object
  properties:
    request:
      type: object
      description: "Request to approve"
  required: ["request"]
EOF

        cat > "$folder_path/prepare.ts" <<'EOF'
export async function main(request: any) {
  console.log("Preparing approval request:", request)
  return {
    ...request,
    requested_at: new Date().toISOString()
  }
}
EOF

        cat > "$folder_path/approval.ts" <<'EOF'
export async function main(request: any) {
  console.log("Waiting for approval...")
  // This step will suspend and wait for user input
  // The resume form will provide the approved/comments fields
  return {
    status: "pending",
    request
  }
}
EOF

        cat > "$folder_path/process.ts" <<'EOF'
export async function main(request: any, decision: any) {
  console.log("Processing decision:", decision)

  if (decision.approved) {
    return {
      success: true,
      message: "Request approved",
      comments: decision.comments || "No comments"
    }
  } else {
    return {
      success: false,
      message: "Request rejected",
      comments: decision.comments || "No comments"
    }
  }
}
EOF
        ;;

    6)
        # Empty Flow
        cat > "$folder_path/flow.yaml" <<'EOF'
summary: "New workflow"
description: "Description of your workflow"
value:
  modules:
    - id: step1
      value:
        type: rawscript
        content: '!inline step1.ts'
        language: bun
        input_transforms:
          input:
            type: javascript
            expr: "flow_input.input"

schema:
  type: object
  properties:
    input:
      type: string
      description: "Input parameter"
  required: ["input"]
EOF

        cat > "$folder_path/step1.ts" <<'EOF'
export async function main(input: string) {
  console.log("Processing:", input)
  return {
    success: true,
    result: input
  }
}
EOF
        ;;

    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo
echo "✓ Created flow: $folder_path/"
echo

# Ask if user wants to generate locks
read -p "Generate flow locks? (Y/n): " generate
if [[ "$generate" != "n" && "$generate" != "N" ]]; then
    echo
    echo "Running: wmill flow generate-locks --yes"
    if wmill flow generate-locks --yes; then
        echo "✓ Flow locks generated successfully"
    else
        echo "⚠ Flow lock generation failed - check flow.yaml syntax"
        exit 1
    fi
fi

echo
echo "=== Next Steps ==="
echo "1. Edit the flow and scripts in: $folder_path/"
echo "2. Test: wmill flow run ${folder_path%.*}"
echo "3. Deploy: wmill sync push"
echo

# Ask if user wants to open the folder
if command -v code &> /dev/null; then
    read -p "Open in VS Code? (y/N): " open_code
    if [[ "$open_code" == "y" || "$open_code" == "Y" ]]; then
        code "$folder_path"
    fi
fi
