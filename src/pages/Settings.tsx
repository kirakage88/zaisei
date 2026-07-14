import { useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { db } from "@/lib/db"
import { useTheme } from "@/components/theme-provider"
import { Download, Upload, Trash2, Check } from "lucide-react"
import { PageTitle } from "@/components/layout/PageTitle"
import { SakuraPetal } from "@/components/layout/SakuraPetal"
import { cn } from "@/lib/utils"

const TABLES = ["accounts", "transactions", "debts", "kakeiboMonths", "kakeiboCheckins"] as const

async function exportData() {
  const data: Record<string, unknown[]> = {}
  for (const table of TABLES) {
    data[table] = await db.table(table).toArray()
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `zaisei-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const DATE_FIELDS: Record<string, string[]> = {
  transactions: ["date", "createdAt"],
  accounts: ["createdAt"],
  debts: ["createdAt"],
  kakeiboMonths: ["createdAt", "closedAt"],
  kakeiboCheckins: ["date"],
}

function reviveDates(table: string, rows: Record<string, unknown>[]) {
  const fields = DATE_FIELDS[table]
  if (!fields) return rows
  return rows.map((row) => {
    const copy = { ...row }
    for (const f of fields) {
      if (typeof copy[f] === "string") copy[f] = new Date(copy[f] as string)
    }
    return copy
  })
}

async function importData(file: File): Promise<{ success: boolean; message: string }> {
  try {
    const text = await file.text()
    const data = JSON.parse(text)

    for (const table of TABLES) {
      if (Array.isArray(data[table])) {
        const rows = reviveDates(table, data[table])
        await db.table(table).clear()
        await db.table(table).bulkAdd(rows)
      }
    }
    return { success: true, message: `Imported ${TABLES.length} tables successfully.` }
  } catch (err) {
    return { success: false, message: `Import failed: ${err instanceof Error ? err.message : "Unknown error"}` }
  }
}

function SwatchRow({ colors }: { colors: string[] }) {
  return (
    <div className="flex gap-1 md:gap-1.5 mt-2">
      {colors.map((c, i) => (
        <div
          key={i}
          className="size-4 md:size-5 rounded-full border border-border/50"
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  )
}

const SUMI_SWATCHES = ["#F7F5F1", "#FFFFFF", "#6B8F5E", "#7FA372", "#6B8F5E", "#B96A4A"]
const SAKURA_SWATCHES = ["#FFF6F7", "#FFFFFF", "#E8899C", "#F2A3B3", "#A8C3A0", "#E4767B"]

export default function SettingsPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [importResult, setImportResult] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const { palette, setPalette, mode, setMode } = useTheme()

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsImporting(true)
    setImportResult(null)
    const result = await importData(file)
    setImportResult(result.message)
    setIsImporting(false)
    if (fileRef.current) fileRef.current.value = ""
  }

  const handleClearAll = async () => {
    if (!confirm("This will permanently delete ALL your data. Are you sure?")) return
    setIsClearing(true)
    try {
      for (const table of TABLES) {
        await db.table(table).clear()
      }
      setImportResult("All data cleared.")
    } finally {
      setIsClearing(false)
    }
  }

  const handlePaletteChange = (newPalette: "sumi" | "sakura") => {
    const root = document.documentElement
    root.classList.add("theme-transition")
    setPalette(newPalette)
    setTimeout(() => root.classList.remove("theme-transition"), 350)
  }

  return (
    <div>
      <PageTitle>Settings</PageTitle>

      <div className="mt-6 space-y-6">
        {/* Theme */}
        <Card>
          <CardContent className="p-4 md:p-6 space-y-4">
            <div>
              <h3 className="font-medium">Theme</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a color palette. Works with both light and dark mode.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handlePaletteChange("sumi")}
                className={cn(
                  "relative flex flex-col items-start gap-1 p-2.5 md:p-3 rounded-xl border-2 transition-all duration-200",
                  palette === "sumi"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium">Sumi</span>
                  {palette === "sumi" && <Check className="size-3.5 text-primary" />}
                </div>
                <span className="text-[10px] text-muted-foreground">Earthy sage & ink</span>
                <SwatchRow colors={SUMI_SWATCHES} />
              </button>

              <button
                onClick={() => handlePaletteChange("sakura")}
                className={cn(
                  "relative flex flex-col items-start gap-1 p-2.5 md:p-3 rounded-2xl border-2 transition-all duration-200",
                  palette === "sakura"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30"
                )}
              >
                <div className="flex items-center gap-1.5">
                  {palette === "sakura" && <SakuraPetal className="h-3 w-3 text-accent-active" />}
                  <span className="text-sm font-medium">Sakura</span>
                  {palette === "sakura" && <Check className="size-3.5 text-primary" />}
                </div>
                <span className="text-[10px] text-muted-foreground">Cherry blossom pink</span>
                <SwatchRow colors={SAKURA_SWATCHES} />
              </button>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">Mode</p>
              <div className="flex gap-2">
                {(["light", "dark", "system"] as const).map((m) => (
                  <Button
                    key={m}
                    variant={mode === m ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMode(m)}
                    className="capitalize"
                  >
                    {m}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backup & Restore */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <h3 className="font-medium">Backup & Restore</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Export your data as a JSON file, or import a backup.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" onClick={exportData} className="gap-2">
                <Download className="size-4" />
                Export Data
              </Button>
              <Button
                variant="outline"
                onClick={() => fileRef.current?.click()}
                disabled={isImporting}
                className="gap-2"
              >
                <Upload className="size-4" />
                {isImporting ? "Importing..." : "Import Data"}
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>

            {importResult && (
              <p className="text-sm text-muted-foreground">{importResult}</p>
            )}
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <h3 className="font-medium">Data Management</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Clear all data from IndexedDB. This cannot be undone.
              </p>
            </div>

            <Button
              variant="destructive"
              onClick={handleClearAll}
              disabled={isClearing}
              className="gap-2 w-fit"
            >
              <Trash2 className="size-4" />
              {isClearing ? "Clearing..." : "Clear All Data"}
            </Button>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <h3 className="font-medium">About</h3>
              <Separator className="mt-2" />
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Version</span>
                <span className="tabular-nums">v0.7.3</span>
              </div>
              <div className="flex justify-between">
                <span>Storage</span>
                <span>IndexedDB (client-side only)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
