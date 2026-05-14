"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { transitionStage, moveLayerToIndukan, moveIndukanToAfkir } from "@/lib/actions/chickens";
import { ChickenStage } from "@/types/database";
import { getStageName } from "@/lib/lifecycle";
import { ArrowLeft } from "lucide-react";

interface StageTransitionModalProps {
  batchId: string;
  batchCode: string;
  currentStage: ChickenStage;
  currentQuantity?: number;
}

export function StageTransitionModal({ batchId, batchCode, currentStage, currentQuantity = 0 }: StageTransitionModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"main" | "indukan" | "afkir">("main");
  const [betina, setBetina] = useState(0);
  const [jantan, setJantan] = useState(0);
  const [afkirQty, setAfkirQty] = useState(0);
  const [error, setError] = useState("");

  function handleOpenChange(val: boolean) {
    setOpen(val);
    if (!val) { setStep("main"); setBetina(0); setJantan(0); setAfkirQty(0); setError(""); }
  }

  async function handleTransition(toStage: ChickenStage) {
    setLoading(true);
    await transitionStage(batchId, toStage);
    setLoading(false);
    setOpen(false);
  }

  async function handleMoveIndukan() {
    setError("");
    if (betina + jantan <= 0) { setError("Masukkan minimal 1 ekor"); return; }
    setLoading(true);
    const result = await moveLayerToIndukan(batchId, betina, jantan);
    setLoading(false);
    if (result.success) { setOpen(false); }
    else setError(result.error || "Gagal");
  }

  async function handleMoveAfkir() {
    setError("");
    if (afkirQty <= 0) { setError("Masukkan minimal 1 ekor"); return; }
    setLoading(true);
    const result = await moveIndukanToAfkir(batchId, afkirQty);
    setLoading(false);
    if (result.success) { setOpen(false); }
    else setError(result.error || "Gagal");
  }

  const sisa = currentQuantity - betina - jantan;
  const sisaAfkir = currentQuantity - afkirQty;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full">Ubah Stage</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {step === "indukan" && (
              <button onClick={() => setStep("main")} className="mr-2 inline-flex items-center text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            {batchCode}
          </DialogTitle>
        </DialogHeader>

        {step === "main" && (
          <>
            <p className="text-sm text-muted-foreground">
              Stage saat ini: <strong>{getStageName(currentStage)}</strong>
              {currentQuantity > 0 && <> · <strong>{currentQuantity} ekor</strong></>}
            </p>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {currentStage === "starter" && (
                <Button variant="outline" onClick={() => handleTransition("grower")} disabled={loading} className="flex-col h-20 col-span-2">
                  <span className="text-lg">🐥</span>
                  <span>Pindah ke Grower</span>
                </Button>
              )}
              {currentStage === "grower" && (
                <>
                  <Button variant="outline" onClick={() => handleTransition("layer")} disabled={loading} className="flex-col h-20">
                    <span className="text-lg">🥚</span>
                    <span>Pindah ke Layer</span>
                  </Button>
                  <Button variant="outline" onClick={() => setStep("indukan")} disabled={loading} className="flex-col h-20">
                    <span className="text-lg">🐓</span>
                    <span>Jadikan Indukan</span>
                  </Button>
                </>
              )}
              {currentStage === "layer" && (
                <>
                  <Button variant="outline" onClick={() => handleTransition("afkir")} disabled={loading} className="flex-col h-20">
                    <span className="text-lg">🪙</span>
                    <span>Afkir Semua</span>
                  </Button>
                  <Button variant="outline" onClick={() => { setBetina(0); setJantan(0); setStep("indukan"); }} disabled={loading} className="flex-col h-20">
                    <span className="text-lg">🐓</span>
                    <span>Pindah ke Indukan</span>
                  </Button>
                </>
              )}
              {currentStage === "indukan" && (
                <Button variant="outline" onClick={() => { setAfkirQty(0); setStep("afkir"); }} disabled={loading} className="flex-col h-20 col-span-2">
                  <span className="text-lg">🪙</span>
                  <span>Pindah ke Afkir</span>
                </Button>
              )}
              {currentStage === "afkir" && (
                <Button variant="outline" onClick={() => handleTransition("harvested")} disabled={loading}
                  className="flex-col h-20 col-span-2 text-green-700 border-green-400 hover:bg-green-50 dark:text-green-400 dark:border-green-600 dark:hover:bg-green-900/30">
                  <span className="text-lg">💰</span>
                  <span>Tandai Panen / Jual</span>
                </Button>
              )}
            </div>
          </>
        )}

        {step === "indukan" && (
          <div className="space-y-4 mt-1">
            <p className="text-sm text-muted-foreground">
              Masukkan jumlah yang dipindahkan. Sisanya tetap di Layer.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>🐓 Indukan Betina</Label>
                <Input type="number" min="0" max={currentQuantity} value={betina || ""} placeholder="0"
                  onChange={e => setBetina(Math.max(0, parseInt(e.target.value) || 0))} />
              </div>
              <div className="space-y-1.5">
                <Label>🐓 Indukan Jantan</Label>
                <Input type="number" min="0" max={currentQuantity} value={jantan || ""} placeholder="0"
                  onChange={e => setJantan(Math.max(0, parseInt(e.target.value) || 0))} />
              </div>
            </div>
            <div className={`text-sm rounded-md px-3 py-2 ${sisa < 0 ? "bg-red-500/10 text-red-500" : "bg-muted text-muted-foreground"}`}>
              {sisa < 0
                ? `Melebihi stok! Kurangi ${Math.abs(sisa)} ekor`
                : <>Dipindahkan: <strong>{betina + jantan} ekor</strong> · Sisa di Layer: <strong>{sisa} ekor</strong></>
              }
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setStep("main")}>Batal</Button>
              <Button onClick={handleMoveIndukan} disabled={loading || sisa < 0 || betina + jantan <= 0}>
                {loading ? "Memproses..." : "Konfirmasi"}
              </Button>
            </div>
          </div>
        )}

        {step === "afkir" && (
          <div className="space-y-4 mt-1">
            <p className="text-sm text-muted-foreground">
              Masukkan jumlah yang tidak produktif. Sisanya tetap di Indukan.
            </p>
            <div className="space-y-1.5">
              <Label>🪙 Jumlah Diafkir (maks {currentQuantity} ekor)</Label>
              <Input
                type="number"
                min="1"
                max={currentQuantity}
                value={afkirQty || ""}
                placeholder="0"
                onChange={e => setAfkirQty(Math.max(0, parseInt(e.target.value) || 0))}
              />
            </div>
            <div className={`text-sm rounded-md px-3 py-2 ${sisaAfkir < 0 ? "bg-red-500/10 text-red-500" : "bg-muted text-muted-foreground"}`}>
              {sisaAfkir < 0
                ? `Melebihi stok! Kurangi ${Math.abs(sisaAfkir)} ekor`
                : <>Diafkir: <strong>{afkirQty} ekor</strong> · Sisa di Indukan: <strong>{sisaAfkir} ekor</strong></>
              }
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setStep("main")}>Batal</Button>
              <Button onClick={handleMoveAfkir} disabled={loading || sisaAfkir < 0 || afkirQty <= 0}>
                {loading ? "Memproses..." : "Konfirmasi"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
