import type { ReactNode } from "react";
import type { Finding, Stage } from "../types/onchain";
import { STAGE_LABELS, STAGE_ORDER } from "../types/onchain";
import { Badge } from "./Badge";

export function FindingsList({ findings, renderExtra }: { findings: Finding[]; renderExtra?: (f: Finding) => ReactNode }) {
  const byStage = new Map<Stage, Finding[]>();
  for (const f of findings) {
    const list = byStage.get(f.stage) ?? [];
    list.push(f);
    byStage.set(f.stage, list);
  }

  return (
    <div className="findings">
      {STAGE_ORDER.filter((stage) => byStage.has(stage)).map((stage) => (
        <section key={stage} className="findings__stage">
          <h3>{STAGE_LABELS[stage]}</h3>
          <ul>
            {byStage.get(stage)!.map((f, i) => (
              <li key={i} className="findings__item">
                <Badge tone={f.ok ? "ok" : "ko"}>{f.ok ? "OK" : "KO"}</Badge>
                <div className="findings__item-body">
                  <div className="findings__item-label">{f.label}</div>
                  {f.detail && <div className="findings__item-detail">{f.detail}</div>}
                  {renderExtra?.(f)}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
