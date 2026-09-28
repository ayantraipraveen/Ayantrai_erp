"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  LayoutNode,
  LayoutRowNode,
  LayoutColumnNode,
  LayoutBlockNode,
  LibrarySection,
  LibraryChartCard,
  LibraryMetricCard,
  LibraryKeyInsightItem,
} from "@/lib/redux/types/reportModuleTypes";
import {
  calculateRowSpanSum,
  getRemainingRowSpan,
  findNodeById,
  findParentNode,
  getNodeDepth,
  canAddChildToParent,
  addNodeToParent,
  removeNodeFromTree,
  updateNodeInTree,
  moveNodeInParent,
  validateLayoutTree,
  createDefaultLayoutTree,
  convertCanvasRowsToLayoutTree,
  MAX_BUILDER_DEPTH,
} from "./layoutTreeUtils";
import LayoutNodeRenderer from "./LayoutNodeRenderer";
import AssetPickerDrawer from "./AssetPickerDrawer";
import {
  Plus,
  Trash2,
  Grid,
  ArrowLeft,
  ArrowRight,
  Eye,
  Save,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useAppDispatch } from "@/lib/redux/hooks";
import {
  updateLibrarySection,
  showGlobalToast,
} from "@/lib/redux/slices/reportModuleSlice";

export interface NestedLayoutBuilderProps {
  section: LibrarySection;
  onClose: () => void;
  allCharts?: LibraryChartCard[];
  allMetrics?: LibraryMetricCard[];
  allInsights?: LibraryKeyInsightItem[];
  allSections?: LibrarySection[];
}

export default function NestedLayoutBuilder({
  section,
  onClose,
  allCharts = [],
  allMetrics = [],
  allInsights = [],
  allSections = [],
}: NestedLayoutBuilderProps) {
  const dispatch = useAppDispatch();

  // Initialize tree: use existing layoutTree, or convert from canvasRows, or default starter tree
  const [tree, setTree] = useState<LayoutRowNode>(() => {
    if (section.layoutTree) {
      return section.layoutTree;
    }
    if (section.canvasRows && section.canvasRows.length > 0) {
      return convertCanvasRowsToLayoutTree(section.canvasRows);
    }
    return createDefaultLayoutTree();
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("row-root");
  const [isPreview, setIsPreview] = useState(false);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [targetColumnForAsset, setTargetColumnForAsset] = useState<string | null>(null);

  // Selected node inspection
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return findNodeById(tree, selectedNodeId);
  }, [tree, selectedNodeId]);

  const selectedDepth = useMemo(() => {
    if (!selectedNodeId) return 1;
    return getNodeDepth(tree, selectedNodeId);
  }, [tree, selectedNodeId]);

  // Validation
  const validation = useMemo(() => {
    return validateLayoutTree(tree);
  }, [tree]);

  // ── Action Handlers ─────────────────────────────────────────────────────────

  // Add Root Row
  const handleAddRootRow = useCallback(() => {
    const ts = Date.now();
    const newRow: LayoutRowNode = {
      id: `row-${ts}`,
      type: "row",
      children: [
        {
          id: `col-${ts}-1`,
          type: "column",
          span: 12,
          children: [],
        },
      ],
    };
    setTree((prev) => {
      // If root is a row, wrap in composite or append
      return {
        ...prev,
        children: [...prev.children, newRow as any],
      };
    });
    setSelectedNodeId(`row-${ts}`);
    dispatch(showGlobalToast({ message: "Added 12-Column Row to section", type: "success" }));
  }, [dispatch]);

  // Add Column to Row
  const handleAddColumnToRow = useCallback(
    (rowId: string) => {
      const targetRow = findNodeById(tree, rowId);
      if (!targetRow || targetRow.type !== "row") return;

      const remainingSpan = getRemainingRowSpan(targetRow as LayoutRowNode);
      if (remainingSpan <= 0) {
        dispatch(
          showGlobalToast({
            message: "Cannot add column: Row already has 12/12 span filled.",
            type: "warning",
          })
        );
        return;
      }

      const defaultSpan = Math.min(remainingSpan, 6);
      const ts = Date.now();
      const newCol: LayoutColumnNode = {
        id: `col-${ts}`,
        type: "column",
        span: defaultSpan,
        children: [],
      };

      setTree((prev) => addNodeToParent(prev, rowId, newCol) as LayoutRowNode);
      setSelectedNodeId(newCol.id || null);
      dispatch(showGlobalToast({ message: `Added Column (Span ${defaultSpan}/12)`, type: "info" }));
    },
    [tree, dispatch]
  );

  // Add Nested Row inside Column (Level 2 -> Level 3)
  const handleAddNestedRowToColumn = useCallback(
    (colId: string) => {
      const depth = getNodeDepth(tree, colId);
      if (depth >= MAX_BUILDER_DEPTH) {
        dispatch(
          showGlobalToast({
            message: `Max nesting depth of ${MAX_BUILDER_DEPTH} levels reached.`,
            type: "warning",
          })
        );
        return;
      }

      const ts = Date.now();
      const newRow: LayoutRowNode = {
        id: `nested-row-${ts}`,
        type: "row",
        children: [
          {
            id: `col-sub-${ts}`,
            type: "column",
            span: 12,
            children: [],
          },
        ],
      };

      setTree((prev) => addNodeToParent(prev, colId, newRow) as LayoutRowNode);
      setSelectedNodeId(newRow.id || null);
      dispatch(showGlobalToast({ message: "Added Nested Row inside Column", type: "info" }));
    },
    [tree, dispatch]
  );

  // Add Nested Column inside Column (side-by-side)
  const handleAddNestedColumnToColumn = useCallback(
    (colId: string) => {
      const depth = getNodeDepth(tree, colId);
      if (depth >= MAX_BUILDER_DEPTH) {
        dispatch(
          showGlobalToast({
            message: `Max nesting depth of ${MAX_BUILDER_DEPTH} levels reached.`,
            type: "warning",
          })
        );
        return;
      }

      const ts = Date.now();
      const newCol: LayoutColumnNode = {
        id: `col-sub-${ts}`,
        type: "column",
        span: 6,
        children: [],
      };

      setTree((prev) => addNodeToParent(prev, colId, newCol) as LayoutRowNode);
      setSelectedNodeId(newCol.id || null);
      dispatch(showGlobalToast({ message: "Added Nested Side-by-Side Column", type: "info" }));
    },
    [tree, dispatch]
  );

  // Change Column Span (1-12)
  const handleUpdateSpan = useCallback(
    (colId: string, newSpan: number) => {
      const parentInfo = findParentNode(tree, colId);
      if (!parentInfo || parentInfo.parent.type !== "row") {
        setTree((prev) => updateNodeInTree(prev, colId, { span: newSpan }) as LayoutRowNode);
        return;
      }

      const remainingExcludingThis = getRemainingRowSpan(parentInfo.parent as LayoutRowNode, colId);
      if (newSpan > remainingExcludingThis) {
        dispatch(
          showGlobalToast({
            message: `Span ${newSpan} exceeds row available space (max: ${remainingExcludingThis}).`,
            type: "warning",
          })
        );
        return;
      }

      setTree((prev) => updateNodeInTree(prev, colId, { span: newSpan }) as LayoutRowNode);
    },
    [tree, dispatch]
  );

  // Delete Node
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      if (nodeId === tree.id) {
        dispatch(showGlobalToast({ message: "Cannot delete root row", type: "warning" }));
        return;
      }
      setTree((prev) => removeNodeFromTree(prev, nodeId) as LayoutRowNode);
      setSelectedNodeId(tree.id || null);
      dispatch(showGlobalToast({ message: "Deleted element from layout", type: "info" }));
    },
    [tree, dispatch]
  );

  // Move Node
  const handleMoveNode = useCallback(
    (nodeId: string, dir: "up" | "down" | "left" | "right") => {
      setTree((prev) => moveNodeInParent(prev, nodeId, dir) as LayoutRowNode);
    },
    []
  );

  // Drop / Insert Reusable Asset into Column
  const handleInsertAssetBlock = useCallback(
    (block: LayoutBlockNode) => {
      if (!targetColumnForAsset) return;
      setTree((prev) => addNodeToParent(prev, targetColumnForAsset, block) as LayoutRowNode);
      setSelectedNodeId(block.id || null);
      dispatch(showGlobalToast({ message: `Inserted ${block.title || block.blockType}`, type: "success" }));
      setTargetColumnForAsset(null);
    },
    [targetColumnForAsset, dispatch]
  );

  // Save Layout to Section
  const handleSaveLayout = useCallback(() => {
    if (!validation.valid) {
      dispatch(
        showGlobalToast({
          message: `Cannot save: ${validation.errors[0]}`,
          type: "error",
        })
      );
      return;
    }

    dispatch(
      updateLibrarySection({
        id: section.id,
        layoutTree: tree,
        changes: {
          layoutTree: tree,
        },
      })
    );

    dispatch(
      showGlobalToast({
        message: `Saved nested layout for "${section.name}"!`,
        type: "success",
      })
    );
  }, [dispatch, section.id, section.name, tree, validation]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#080a0e] text-slate-100 overflow-hidden select-none animate-fadeIn">
      {/* ── Studio Top Header Bar ───────────────────────────────────────────── */}
      <header className="h-14 px-5 border-b border-zinc-800 bg-[#0d111a] flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-zinc-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Studio</span>
          </button>

          <div className="h-4 w-px bg-zinc-800" />

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9D61FF] font-bold">
                {section.eyebrow}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                12-Col Nested Grid
              </span>
            </div>
            <h2 className="text-sm font-bold text-white leading-tight">
              {section.name} &middot; Layout Tree Architect
            </h2>
          </div>
        </div>

        {/* Center Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
          <button
            type="button"
            onClick={() => setIsPreview(false)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${!isPreview ? "bg-[#9D61FF] text-white shadow-xs font-bold" : "text-zinc-400 hover:text-white"
              }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Builder Wireframe</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPreview(true)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${isPreview ? "bg-[#9D61FF] text-white shadow-xs font-bold" : "text-zinc-400 hover:text-white"
              }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live A4 Preview</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAddRootRow}
            className="h-8 px-3 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-zinc-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#9D61FF]" />
            <span>Add Row</span>
          </button>

          <button
            type="button"
            onClick={handleSaveLayout}
            className="h-8 px-4 rounded-xl glow-btn-primary font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg text-white"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Section Layout</span>
          </button>
        </div>
      </header>

      {/* ── Contextual Inspector Bar (When a node is selected) ───────────────── */}
      {!isPreview && selectedNode && (
        <div className="h-11 px-5 border-b border-zinc-800/80 bg-[#10141f] flex items-center justify-between gap-4 text-xs flex-shrink-0 text-zinc-300">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase font-bold text-[#9D61FF] px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30">
              {selectedNode.type} &bull; Depth {selectedDepth}/{MAX_BUILDER_DEPTH}
            </span>

            {/* Column Span Selector */}
            {selectedNode.type === "column" && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-zinc-400 font-mono">Span:</span>
                <div className="flex items-center gap-1">
                  {[12, 8, 6, 4, 3, 2, 1].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleUpdateSpan(selectedNode.id || "", s)}
                      className={`w-6 h-6 rounded flex items-center justify-center font-mono font-bold text-[10px] cursor-pointer transition-colors ${(selectedNode as LayoutColumnNode).span === s
                          ? "bg-[#9D61FF] text-white"
                          : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                        }`}
                      title={`Set column span to ${s}/12`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions based on type */}
            {selectedNode.type === "row" && (
              <button
                type="button"
                onClick={() => handleAddColumnToRow(selectedNode.id || "")}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-purple-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Column
              </button>
            )}

            {selectedNode.type === "column" && selectedDepth < MAX_BUILDER_DEPTH && (
              <>
                <button
                  type="button"
                  onClick={() => handleAddNestedRowToColumn(selectedNode.id || "")}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-purple-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3" /> Nested Row
                </button>
                <button
                  type="button"
                  onClick={() => handleAddNestedColumnToColumn(selectedNode.id || "")}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-purple-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3" /> Side-by-Side Col
                </button>
              </>
            )}

            {selectedNode.type === "column" && (
              <button
                type="button"
                onClick={() => {
                  setTargetColumnForAsset(selectedNode.id || "");
                  setAssetPickerOpen(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-[#c49aff] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Sparkles className="w-3 h-3" /> Insert Library Asset
              </button>
            )}
          </div>

          {/* Right Node Navigation & Delete */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleMoveNode(selectedNode.id || "", "left")}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
              title="Move Left / Up"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleMoveNode(selectedNode.id || "", "right")}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
              title="Move Right / Down"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => handleDeleteNode(selectedNode.id || "")}
              className="p-1 rounded hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 cursor-pointer ml-2"
              title="Delete element"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Main Studio Work Area ───────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6 flex flex-col items-center">
        {/* Validation Warning Alert if invalid */}
        {!validation.valid && (
          <div className="w-full max-w-4xl mb-4 p-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{validation.errors[0]}</span>
          </div>
        )}

        {/* Paper Artboard with Recursive Renderer */}
        <div
          className={`w-full max-w-[850px] transition-all rounded-3xl p-6 sm:p-8 shadow-2xl ${isPreview
              ? "bg-white text-slate-900 border border-slate-200"
              : "bg-[#0d1017] border border-zinc-800 text-slate-100"
            }`}
        >
          {/* Section Header */}
          <div className="border-b border-slate-200 dark:border-zinc-800 pb-4 mb-6">
            <span className="text-[11px] font-mono uppercase font-bold text-[#9D61FF] tracking-wider">
              {section.eyebrow}
            </span>
            <h1 className="text-xl font-bold tracking-tight mt-0.5">{section.name}</h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{section.description}</p>
          </div>

          {/* Recursive Layout Tree Renderer */}
          <LayoutNodeRenderer
            node={tree}
            depth={1}
            isBuilder={!isPreview}
            isPrint={false}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            chartsCatalog={allCharts}
            metricsCatalog={allMetrics}
            insightsCatalog={allInsights}
          />
        </div>
      </div>

      {/* ── Asset Picker Drawer (Reusable Library) ──────────────────────────── */}
      <AssetPickerDrawer
        isOpen={assetPickerOpen}
        onClose={() => {
          setAssetPickerOpen(false);
          setTargetColumnForAsset(null);
        }}
        targetColumnId={targetColumnForAsset}
        onSelectBlock={handleInsertAssetBlock}
        chartsCatalog={allCharts}
        metricsCatalog={allMetrics}
        insightsCatalog={allInsights}
        sectionsCatalog={allSections}
      />
    </div>
  );
}
