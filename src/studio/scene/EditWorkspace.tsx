"use client";

import { useState } from "react";

import type { AsciiMatrix } from "@/features/ascii-interaction/image-pipeline/types";
import type { AsciiInteractionConfig } from "@/features/ascii-interaction/types";
import type { ProjectDocument } from "@/features/ascii-engine/document";
import type { SceneDocument } from "@/features/ascii-engine/scene";
import { SceneHistory, runWithHistory } from "@/features/ascii-engine/scene";
import { BrushEngine } from "@/features/ascii-engine/brush";
import {
  insertAssetIntoScene,
  insertProceduralShapeIntoScene,
} from "@/features/ascii-engine/libraries";
import { SelectionModel, createDefaultToolHost } from "@/features/ascii-engine/tools";
import { PanelButton, PanelSection } from "@/studio/ui/controls";
import { LibraryPanel } from "@/studio/panels/LibraryPanel";
import { SceneViewport } from "@/studio/scene/SceneViewport";
import { EditToolsToolbar } from "@/studio/scene/EditToolsToolbar";
import { LayersPanel } from "@/studio/scene/LayersPanel";
import { InspectorPanel } from "@/studio/scene/InspectorPanel";

const historyByScene = new WeakMap<SceneDocument, SceneHistory>();
const hostByScene = new WeakMap<SceneDocument, ReturnType<typeof createDefaultToolHost>>();
const brushByScene = new WeakMap<SceneDocument, BrushEngine>();
const selectionByScene = new WeakMap<SceneDocument, SelectionModel>();

function getSceneRuntime(scene: SceneDocument, project?: ProjectDocument | null) {
  let history = historyByScene.get(scene);
  if (!history) {
    history = new SceneHistory();
    historyByScene.set(scene, history);
  }
  // Persist pastCount/futureCount no ProjectDocument quando disponível.
  project?.bindSceneHistory(history);
  let host = hostByScene.get(scene);
  if (!host) {
    host = createDefaultToolHost();
    hostByScene.set(scene, host);
  }
  let brush = brushByScene.get(scene);
  if (!brush) {
    brush = new BrushEngine();
    brushByScene.set(scene, brush);
  }
  let selection = selectionByScene.get(scene);
  if (!selection) {
    selection = new SelectionModel();
    selectionByScene.set(scene, selection);
  }
  return { history, host, brush, selection };
}

export function EditViewport({
  scene,
  project,
  config,
  onChange,
}: {
  scene: SceneDocument;
  project?: ProjectDocument | null;
  config: AsciiInteractionConfig;
  onChange?: () => void;
}) {
  const { history, host, brush, selection } = getSceneRuntime(scene, project);
  return (
    <SceneViewport
      scene={scene}
      history={history}
      config={config}
      toolHost={host}
      selection={selection}
      brush={brush}
      onChange={onChange}
    />
  );
}

/** Sidebar for Edit tab — shares runtime with EditViewport via WeakMap. */
export function EditSidebar({
  scene,
  project,
  imageResultMatrix,
  onChange,
}: {
  scene: SceneDocument;
  project?: ProjectDocument | null;
  imageResultMatrix?: AsciiMatrix | null;
  onChange?: () => void;
}) {
  const [, setTick] = useState(0);
  const bump = () => {
    setTick((n) => n + 1);
    onChange?.();
  };
  const { history, host, brush, selection } = getSceneRuntime(scene, project);
  selection.syncFromScene(scene.getSelectedObjectIds());

  return (
    <div className="px-3 py-2">
      <EditToolsToolbar
        toolHost={host}
        brush={brush}
        canUndo={history.canUndo}
        canRedo={history.canRedo}
        onUndo={() => {
          history.undo();
          bump();
        }}
        onRedo={() => {
          history.redo();
          bump();
        }}
        onChange={bump}
      />
      <PanelSection title="Scene">
        <PanelButton
          disabled={!imageResultMatrix}
          onClick={() => {
            if (!imageResultMatrix) return;
            runWithHistory(history, scene, "Add from Convert", () => {
              scene.addImageObject(imageResultMatrix, { name: "From Convert" });
            });
            bump();
          }}
        >
          Add from Convert
        </PanelButton>
        {!imageResultMatrix ? (
          <p className="font-mono text-[9px] text-[var(--ui-text-dim)]">
            Converta uma imagem na tab Convert para adicionar à cena.
          </p>
        ) : null}
      </PanelSection>
      <LayersPanel scene={scene} history={history} onChange={bump} />
      <InspectorPanel scene={scene} history={history} onChange={bump} />
      <PanelSection title="Libraries">
        <LibraryPanel
          onInsertAsset={(asset) => {
            runWithHistory(history, scene, `Insert asset ${asset.name}`, () => {
              insertAssetIntoScene(scene, asset);
            });
            bump();
          }}
          onInsertShape={(kind) => {
            runWithHistory(history, scene, `Insert shape ${kind}`, () => {
              insertProceduralShapeIntoScene(scene, kind);
            });
            bump();
          }}
        />
      </PanelSection>
    </div>
  );
}
