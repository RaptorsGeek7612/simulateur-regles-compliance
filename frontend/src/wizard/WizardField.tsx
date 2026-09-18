import type { FieldMeta } from "./fieldMeta";

export function BooleanField({
  meta,
  value,
  onChange,
}: {
  meta: FieldMeta;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="field field--checkbox">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="field__label">{meta.label}</span>
        {meta.help && <span className="field__help">{meta.help}</span>}
      </span>
    </label>
  );
}

export function NumberField({
  meta,
  value,
  onChange,
}: {
  meta: FieldMeta;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="field field--number">
      <span className="field__label">{meta.label}</span>
      {meta.help && <span className="field__help">{meta.help}</span>}
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
      />
    </label>
  );
}
