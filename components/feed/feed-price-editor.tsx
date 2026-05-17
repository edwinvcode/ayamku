"use client";

import { useState } from "react";
import { FEED_RATES, FeedRateKey, FeedRateOverrides } from "@/lib/feed-estimate";
import { saveFeedSettings } from "@/lib/actions/feed-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Pencil, Check, X } from "lucide-react";

const STAGE_KEYS = Object.keys(FEED_RATES) as FeedRateKey[];

interface RowState {
  brand: string;
  pricePerKg: string;
}

function initRows(overrides: FeedRateOverrides): Record<FeedRateKey, RowState> {
  const result = {} as Record<FeedRateKey, RowState>;
  for (const key of STAGE_KEYS) {
    const ov = overrides[key];
    result[key] = {
      brand: ov?.brand ?? "",
      pricePerKg: ov?.pricePerKg ? String(ov.pricePerKg) : "",
    };
  }
  return result;
}

export function FeedPriceEditor({ initialOverrides }: { initialOverrides: FeedRateOverrides }) {
  const [editing, setEditing] = useState(false);
  const [rows, setRows] = useState<Record<FeedRateKey, RowState>>(() => initRows(initialOverrides));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(key: FeedRateKey, field: keyof RowState, value: string) {
    setRows(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const settings = STAGE_KEYS
      .map(key => ({
        stageKey: key,
        brand: rows[key].brand.trim(),
        pricePerKg: parseFloat(rows[key].pricePerKg),
      }))
      .filter(s => s.brand || (!isNaN(s.pricePerKg) && s.pricePerKg > 0));

    const result = await saveFeedSettings(
      settings.map(s => ({
        stageKey: s.stageKey,
        brand: s.brand,
        pricePerKg: isNaN(s.pricePerKg) ? FEED_RATES[s.stageKey].pricePerKg : s.pricePerKg,
      }))
    );

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
            <Settings className="h-4 w-4 text-muted-foreground" />
            Harga Pakan Aktual
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
          {STAGE_KEYS.map(key => {
            const base = FEED_RATES[key];
            const ov = initialOverrides[key];
            const row = rows[key];

            if (!editing) {
              return (
                <div key={key} className="flex items-center justify-between py-2 border-b last:border-0 gap-4 flex-wrap">
                  <div className="min-w-0">
                    <span className="text-sm font-medium">{base.label}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {ov?.brand || base.brand}
                    </span>
                  </div>
                  <div className="text-sm font-mono shrink-0">
                    {ov?.pricePerKg
                      ? <span className="text-foreground">Rp {ov.pricePerKg.toLocaleString("id-ID")}/kg</span>
                      : <span className="text-muted-foreground">Rp {base.pricePerKg.toLocaleString("id-ID")}/kg <span className="text-xs">(default)</span></span>
                    }
                  </div>
                </div>
              );
            }

            return (
              <div key={key} className="grid grid-cols-[80px_1fr_140px] items-center gap-2 py-1">
                <span className="text-sm font-medium">{base.label}</span>
                <Input
                  value={row.brand}
                  onChange={e => handleChange(key, "brand", e.target.value)}
                  placeholder={base.brand}
                  className="h-8 text-sm"
                />
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rp</span>
                  <Input
                    type="number"
                    value={row.pricePerKg}
                    onChange={e => handleChange(key, "pricePerKg", e.target.value)}
                    placeholder={String(base.pricePerKg)}
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
            <p className="text-xs text-muted-foreground">Kosongkan harga untuk pakai nilai default.</p>
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
