import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatDateShort, getDaysDiff } from "@/lib/utils";
import { Lightbulb, HeartPulse, Clock3, GlassWater, Droplets, Thermometer, Leaf } from "lucide-react";
import { VaccinationForm } from "@/components/vaccinations/vaccination-form";
import { EditVaccinationButton } from "@/components/vaccinations/edit-vaccination-button";
import { deleteVaccination } from "@/lib/actions/vaccinations";
import { ConfirmDeleteButton } from "@/components/ui/confirm-delete-button";

export default async function VaccinationsPage() {
  const supabase = createClient();
  const [{ data: vaccinations }, { data: batches }] = await Promise.all([
    supabase
      .from("vaccinations")
      .select("*, chicken_batches(batch_code)")
      .order("date", { ascending: false }),
    supabase
      .from("chicken_batches")
      .select("id, batch_code, stage, quantity, breeder_gender, hatch_date")
      .neq("stage", "harvested")
      .order("batch_code", { ascending: true }),
  ]);

  const SCHEDULE = [
    { age: "4 Hari",     vaccine: "ND + IB (Live)",    method: "Tetes Mata/Hidung", target: "Newcastle Disease & Bronchitis" },
    { age: "12–14 Hari", vaccine: "Gumboro (IBD)",      method: "Air Minum",         target: "Gumboro" },
    { age: "18–21 Hari", vaccine: "ND + AI (Killed)",   method: "Suntik (Injeksi)",  target: "Tetelo & Flu Burung" },
    { age: "28 Hari",    vaccine: "Gumboro (Ulangan)",  method: "Air Minum",         target: "Penguatan Gumboro" },
    { age: "8 Minggu",   vaccine: "Coryza",             method: "Suntik",            target: "Pilek Ayam (Snot)" },
    { age: "12 Minggu",  vaccine: "ND + IB + EDS",      method: "Suntik",            target: "Persiapan masa bertelur" },
  ];

  const METHOD_BADGE: Record<string, string> = {
    "Tetes Mata/Hidung": "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    "Air Minum":         "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300",
    "Suntik (Injeksi)":  "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
    "Suntik":            "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  };

  const TIPS = [
    { icon: HeartPulse, title: "Kondisi Ayam Harus Fit",      body: "Jangan pernah vaksin ayam yang lagi lemes, ngantuk, atau bersin-bersin. Vaksin itu virus yang dilemahkan — kalau ayam lagi drop, malah bisa jadi penyakit." },
    { icon: Clock3,     title: "Waktu Eksekusi",               body: "Paling bagus pagi hari (06.00–09.00) atau sore saat suhu tidak panas. Suhu panas bisa bikin virus dalam vaksin mati sebelum masuk ke tubuh ayam." },
    { icon: GlassWater, title: "Puasa Minum Dulu",             body: "Khusus vaksin via air minum, cabut tempat minumnya 1–2 jam sebelum vaksin dikasih. Biar langsung berebut minum dan habis dalam kurang dari 2 jam." },
    { icon: Droplets,   title: "Air Harus Steril",             body: "Gunakan air bebas kaporit. Kalau pakai air PDAM, endapkan dulu atau pakai vaccine stabilizer yang banyak dijual di toko ternak." },
    { icon: Thermometer,title: "Manajemen Rantai Dingin",      body: "Saat beli vaksin, bawa termos atau wadah pakai es batu. Vaksin tidak boleh kena sinar matahari langsung atau suhu ruang terlalu lama." },
    { icon: Leaf,       title: "Pasca Vaksin",                 body: "Setelah vaksin, kasih vitamin anti-stres di air minum selama 2–3 hari biar ayam tidak 'kaget' pasca eksekusi." },
  ];

  return (
    <div className="space-y-4">
      <Tabs defaultValue="riwayat">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList>
            <TabsTrigger value="riwayat">Riwayat</TabsTrigger>
            <TabsTrigger value="jadwal">Jadwal Standar</TabsTrigger>
            <TabsTrigger value="tips">Tips Pro</TabsTrigger>
          </TabsList>
          {/* Tombol tambah tetap visible di semua tab */}
          <VaccinationForm batches={batches || []} />
        </div>

        {/* Tab Riwayat */}
        <TabsContent value="riwayat">
          <Card>
            <CardContent className="pt-4">
              {(vaccinations || []).length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Belum ada data vaksinasi.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Vaksin</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Jadwal Berikutnya</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(vaccinations || []).map((vacc: any) => {
                      const isDue = vacc.next_due_date && getDaysDiff(new Date(vacc.next_due_date)) < 0;
                      const isDueSoon = vacc.next_due_date && getDaysDiff(new Date(vacc.next_due_date)) >= 0 && getDaysDiff(new Date(), new Date(vacc.next_due_date)) <= 7;
                      return (
                        <TableRow key={vacc.id}>
                          <TableCell>{formatDateShort(vacc.date)}</TableCell>
                          <TableCell className="font-medium">{vacc.vaccine_type}</TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {vacc.chicken_batches?.batch_code || "-"}
                          </TableCell>
                          <TableCell>{vacc.quantity} ekor</TableCell>
                          <TableCell>
                            {vacc.next_due_date ? (
                              <Badge variant={isDue ? "destructive" : isDueSoon ? "warning" : "secondary"}>
                                {formatDateShort(vacc.next_due_date)}
                              </Badge>
                            ) : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <EditVaccinationButton vaccination={vacc} batches={batches || []} />
                              <ConfirmDeleteButton
                                onConfirm={deleteVaccination.bind(null, vacc.id)}
                                description="Data vaksinasi ini akan dihapus permanen."
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Jadwal Standar */}
        <TabsContent value="jadwal">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Jadwal Vaksinasi Standar KUB</CardTitle>
              <p className="text-sm text-muted-foreground">Panduan urutan vaksin berdasarkan umur ayam</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-28">Umur Ayam</TableHead>
                    <TableHead>Jenis Vaksin</TableHead>
                    <TableHead>Cara Pemberian</TableHead>
                    <TableHead>Target Penyakit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SCHEDULE.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium whitespace-nowrap">{row.age}</TableCell>
                      <TableCell className="font-mono text-sm">{row.vaccine}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${METHOD_BADGE[row.method] ?? "bg-gray-100 text-gray-800"}`}>
                          {row.method}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{row.target}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Tips Pro */}
        <TabsContent value="tips">
          <Card className="border-amber-200 dark:border-amber-800/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Lightbulb className="h-4 w-4" />
                Tips Pro biar Vaksinnya Manjur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {TIPS.map(({ icon: Icon, title, body }) => (
                  <div key={title} className="flex gap-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3">
                    <div className="mt-0.5 shrink-0">
                      <Icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">{title}</p>
                      <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5 leading-relaxed">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
