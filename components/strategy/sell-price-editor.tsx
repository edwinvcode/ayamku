"use client";

import { useState } from "react";
import { ChickenStage } from "@/types/database";
import { MARKET_REFERENCE_PRICE, SellPriceOverrides } from "@/lib/strategy";
import { saveSellSettings } from "@/lib/actions/sell-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, Pencil, Check, X } from "lucide-react";

const SELLABLE_STAGES: { key: ChickenStage; label: string }[] = [
  { key: "grower",  label: "Grower" },
  { key: "layer",   label: "Layer" },
  { key: "afkir",   label: "Afkir" },
  { key: "indukan", label: "Indukan" },
];

type RowState = Record<ChickenStage, string>;

function initRows(overrides: SellPriceOverrides): RowState {
  const result = {} as RowState;
  for (const { key } of SELLABLE_STAGES) {
    result[key] = overrides[key] ? String(overrides[key]) : "";
  }
  return result;
}

export function SellPriceEditor({ initialOverrides }: { initialOverrides: SellPriceOverrides }) {
  const [editing, setEditing] = useState(false);
  const [rows, setRows] = useState<RowState>(() => initRows(initialOverrides));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(key: ChickenStage, value: string) {
    setRows(prev => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    const settings = SELLABLE_STAGES
      .map(({ key }) => ({ stageKey: key, pricePerHead: parseFloat(rows[key]) }))
      .filter(s => !isNaN(s.pricePerHead) && s.pricePerHead > 0);

    const result = await saveSellSettings(settings);
    setSaving(false);
    if (result.success) {
      setEditing(false);
    } else {
      setError(result.error ?? "Gagal menyimpan");
    }
  }

  function handleCancel() {
    setRows(initRows(initialOverrides));
    setEditing(false);
    setError(null);
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            Harga Jual per Fase
          </CardTitle>
          {!editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Edit Harga
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {SELLABLE_STAGES.map(({ key, label }) => {
            const custom = initialOverrides[key];
            const reference = MARKET_REFERENCE_PRICE[key];

            if (!editing) {
              return (
                <div key={key} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm font-medium">{label}</span>
                  <div className="text-sm font-mono">
                    {custom !== undefined
                      ? <span className="text-foreground font-semibold">Rp {custom.toLocaleString("id-ID")}/ekor</span>
                      : <span className="text-muted-foreground">Rp {reference.toLocaleString("id-ID")}/ekor <span className="text-xs">(referensi)</span></span>
                    }
                  </div>
                </div>
              );
            }

            return (
              <div key={key} className="grid grid-cols-[100px_1fr] items-center gap-3 py-1">
                <span className="text-sm font-medium">{label}</span>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rp</span>
                  <Input
                    type="number"
                    value={rows[key]}
                    onChange={e => handleChange(key, e.target.value)}
                    placeholder={`${reference.toLocaleString("id-ID")} (referensi)`}
                    className="h-8 text-sm pl-7"
                    min={1}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {editing && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t gap-3 flex-wrap">
            <p className="text-xs text-muted-foreground">Kosongkan untuk pakai harga referensi pasar KUB.</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving}>
                <X className="h-3.5 w-3.5 mr-1" />
                Batal
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <Check className="h-3.5 w-3.5 mr-1" />
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        )}

        {error && <p className="text-xs text-destructive mt-2">{error}</p>}
      </CardContent>
    </Card>
  );
}
