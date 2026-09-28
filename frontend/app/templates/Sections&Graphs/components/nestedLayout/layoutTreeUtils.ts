import {
  LayoutBlockNode,
  LayoutColumnNode,
  LayoutRowNode,
  LayoutNode,
  LayoutBlockType,
  CanvasRow,
  CanvasCell,
} from "@/lib/redux/types/reportModuleTypes";

export const MAX_BUILDER_DEPTH = 3;

/**
 * Calculates sum of spans of all immediate column children in a row.
 */
export function calculateRowSpanSum(children: LayoutNode[]): number {
  return children.reduce((sum, child) => {
    if (child.type === "column") {
      return sum + (child.span || 12);
    }
    // Direct blocks or rows inside row
    return sum;
  }, 0);
}

/**
 * Calculates remaining available span in a row (0 to 12).
 */
export function getRemainingRowSpan(row: LayoutRowNode, excludeColumnId?: string): number {
  const currentSum = (row.children || []).reduce((sum, child) => {
    if (child.type === "column" && child.id !== excludeColumnId) {
      return sum + (child.span || 0);
    }
    return sum;
  }, 0);
  return Math.max(0, 12 - currentSum);
}

/**
 * Finds a node by ID anywhere in the tree.
 */
export function findNodeById(root: LayoutNode, id: string): LayoutNode | null {
  if (root.id === id) return root;
  if ("children" in root && Array.isArray(root.children)) {
    for (const child of root.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Finds the parent and child index of a node by ID.
 */
export function findParentNode(
  root: LayoutNode,
  childId: string
): { parent: LayoutRowNode | LayoutColumnNode; index: number } | null {
  if ("children" in root && Array.isArray(root.children)) {
    const idx = root.children.findIndex((c) => c.id === childId);
    if (idx !== -1) {
      return { parent: root as LayoutRowNode | LayoutColumnNode, index: idx };
    }
    for (const child of root.children) {
      const found = findParentNode(child, childId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Calculates the depth of a specific node within the tree (root row = 1).
 */
export function getNodeDepth(root: LayoutNode, targetId: string, currentDepth = 1): number {
  if (root.id === targetId) return currentDepth;
  if ("children" in root && Array.isArray(root.children)) {
    for (const child of root.children) {
      const d = getNodeDepth(child, targetId, currentDepth + 1);
      if (d !== -1) return d;
    }
  }
  return -1;
}

/**
 * Returns the maximum depth of a subtree starting at node.
 */
export function getMaxSubtreeDepth(node: LayoutNode): number {
  if (!("children" in node) || !Array.isArray(node.children) || node.children.length === 0) {
    return 1;
  }
  const childDepths = node.children.map((c) => getMaxSubtreeDepth(c));
  return 1 + Math.max(...childDepths);
}

/**
 * Checks whether a child can be added to the target parent without exceeding MAX_BUILDER_DEPTH (3).
 */
export function canAddChildToParent(root: LayoutNode, parentId: string): boolean {
  const parentDepth = getNodeDepth(root, parentId);
  if (parentDepth === -1) return false;
  return parentDepth < MAX_BUILDER_DEPTH;
}

/**
 * Immutably adds a child node to a parent node by ID.
 */
export function addNodeToParent(
  root: LayoutNode,
  parentId: string,
  newNode: LayoutNode,
  index?: number
): LayoutNode {
  if (root.id === parentId) {
    if ("children" in root && Array.isArray(root.children)) {
      const newChildren = [...root.children];
      if (typeof index === "number" && index >= 0 && index <= newChildren.length) {
        newChildren.splice(index, 0, newNode as any);
      } else {
        newChildren.push(newNode as any);
      }
      return { ...root, children: newChildren } as LayoutNode;
    }
    return root;
  }

  if ("children" in root && Array.isArray(root.children)) {
    const updatedChildren = root.children.map((child) =>
      addNodeToParent(child, parentId, newNode, index)
    );
    return { ...root, children: updatedChildren } as LayoutNode;
  }

  return root;
}

/**
 * Immutably removes a node from the tree by ID.
 */
export function removeNodeFromTree(root: LayoutNode, targetId: string): LayoutNode {
  if (root.id === targetId) return root;

  if ("children" in root && Array.isArray(root.children)) {
    const filtered = root.children
      .filter((c) => c.id !== targetId)
      .map((c) => removeNodeFromTree(c, targetId));
    return { ...root, children: filtered as any };
  }

  return root;
}

/**
 * Immutably updates a node in the tree by ID.
 */
export function updateNodeInTree(
  root: LayoutNode,
  targetId: string,
  updates: Partial<LayoutNode>
): LayoutNode {
  if (root.id === targetId) {
    return { ...root, ...updates } as LayoutNode;
  }

  if ("children" in root && Array.isArray(root.children)) {
    const updated = root.children.map((c) => updateNodeInTree(c, targetId, updates));
    return { ...root, children: updated as any };
  }

  return root;
}

/**
 * Immutably moves a node within its parent (up/down/left/right).
 */
export function moveNodeInParent(
  root: LayoutNode,
  targetId: string,
  direction: "left" | "right" | "up" | "down"
): LayoutNode {
  const info = findParentNode(root, targetId);
  if (!info) return root;

  const { parent, index } = info;
  const isForward = direction === "right" || direction === "down";
  const targetIndex = isForward ? index + 1 : index - 1;

  if (targetIndex < 0 || targetIndex >= parent.children.length) {
    return root; // Already at boundary
  }

  const newChildren = [...parent.children];
  const [removed] = newChildren.splice(index, 1);
  newChildren.splice(targetIndex, 0, removed);

  return updateNodeInTree(root, parent.id || "", { children: newChildren });
}

/**
 * Validates a layout tree against max depth (3) and span sum (<= 12).
 */
export function validateLayoutTree(
  tree: LayoutRowNode
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  function traverse(node: LayoutNode, depth: number) {
    if (depth > MAX_BUILDER_DEPTH && node.type !== "block") {
      errors.push(`Node ${node.id || "unnamed"} exceeds max depth of ${MAX_BUILDER_DEPTH} (depth: ${depth})`);
    }

    if (node.type === "row") {
      const spanSum = calculateRowSpanSum(node.children || []);
      if (spanSum > 12) {
        errors.push(`Row ${node.id || "unnamed"} columns sum to ${spanSum}, which exceeds the 12-column limit.`);
      }
    }

    if ("children" in node && Array.isArray(node.children)) {
      for (const child of node.children) {
        traverse(child, depth + 1);
      }
    }
  }

  traverse(tree, 1);
  return { valid: errors.length === 0, errors };
}

/**
 * Generates an initial sample layout tree matching the user's architectural specification:
 * Row (span 12) -> Column (8) [with nested Row containing Chart] + Column (4) [with Metric Card]
 */
export function createDefaultLayoutTree(): LayoutRowNode {
  const ts = Date.now();
  return {
    id: `row-root-${ts}`,
    type: "row",
    children: [
      {
        id: `col-left-${ts}`,
        type: "column",
        span: 8,
        children: [
          {
            id: `row-inner-top-${ts}`,
            type: "row",
            children: [
              {
                id: `block-attendance-${ts}`,
                type: "block",
                blockType: "chart",
                refId: "attendance",
                title: "Workforce Safety Adherence & Attendance Trends",
                data: {
                  chartType: "multi-line",
                  dataSourceField: "attendance_trends",
                  description: "Continuous telemetry tracking worker check-ins and safety zone compliance over time.",
                },
              },
            ],
          },
        ],
      },
      {
        id: `col-right-${ts}`,
        type: "column",
        span: 4,
        children: [
          {
            id: `block-total-workers-${ts}`,
            type: "block",
            blockType: "metric-card",
            refId: "total-workers",
            title: "Total Deployed Workforce",
            data: {
              value: "142",
              tintColor: "blue",
              trendDirection: "up",
              trendValue: "+8.4% vs last shift",
            },
          },
          {
            id: `block-compliance-rate-${ts}`,
            type: "block",
            blockType: "metric-card",
            refId: "compliance-rate",
            title: "PPE Sensor Compliance",
            data: {
              value: "99.4%",
              tintColor: "green",
              trendDirection: "up",
              trendValue: "+1.2% ISO benchmark",
            },
          },
          {
            id: `block-key-insight-${ts}`,
            type: "block",
            blockType: "key-insights",
            refId: "supervisory-note",
            title: "Shift Supervisor Field Log",
            data: {
              text: "Full compliance logged across North Yard excavation zones. Zero helmet detachments recorded in high-risk zones.",
            },
          },
        ],
      },
    ],
  };
}

/**
 * Converts legacy CanvasRows into a 12-column LayoutRowNode tree.
 * 1 colSpan -> span 3
 * 2 colSpan -> span 6
 * 3 colSpan -> span 9
 * 4 colSpan -> span 12
 */
export function convertCanvasRowsToLayoutTree(rows: CanvasRow[]): LayoutRowNode {
  const ts = Date.now();
  if (!rows || rows.length === 0) {
    return createDefaultLayoutTree();
  }

  return {
    id: `row-root-${ts}`,
    type: "row",
    children: rows.map((row, rIdx) => ({
      id: `col-row-wrapper-${row.id || rIdx}`,
      type: "column",
      span: 12,
      children: [
        {
          id: `row-${row.id || rIdx}`,
          type: "row",
          children: (row.cells || []).map((cell, cIdx) => {
            const span = Math.min(12, Math.max(1, (cell.colSpan || 1) * 3));
            let blockType: LayoutBlockType = "text";
            let refId: string | undefined = cell.id;
            let title: string | undefined = undefined;
            let data: any = undefined;

            if (cell.blockType === "chart" && cell.chart) {
              blockType = "chart";
              refId = cell.chart.id;
              title = cell.chart.title;
              data = cell.chart;
            } else if (cell.blockType === "metric-card" && cell.metricCard) {
              blockType = "metric-card";
              refId = cell.metricCard.id;
              title = cell.metricCard.label;
              data = cell.metricCard;
            } else if (cell.blockType === "insight" && cell.insight) {
              blockType = "key-insights";
              refId = cell.insight.id;
              title = "Supervisory Insight";
              data = cell.insight;
            } else if (cell.blockType === "text" && cell.textBlock) {
              blockType = "text";
              refId = cell.textBlock.id;
              title = cell.textBlock.content ? cell.textBlock.content.slice(0, 40) : "Text Block";
              data = cell.textBlock;
            } else {
              blockType = "text";
              title = "Custom Canvas Block";
            }

            return {
              id: `col-${cell.id || cIdx}`,
              type: "column" as const,
              span,
              children: [
                {
                  id: `block-${cell.id || cIdx}`,
                  type: "block" as const,
                  blockType,
                  refId,
                  title,
                  data,
                },
              ],
            };
          }),
        },
      ],
    })),
  };
}
