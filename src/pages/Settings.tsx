import { useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { db } from "@/lib/db"
import { Download, Upload, Trash2 } from "lucide-react"

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

async function importData(file: File): Promise<{ success: boolean; message: string }> {
  try {
    const text = await file.text()
    const data = JSON.parse(text)

    for (const table of TABLES) {
      if (Array.isArray(data[table])) {
        await db.table(table).clear()
        await db.table(table).bulkAdd(data[table])
      }
    }
    return { success: true, message: `Imported ${TABLES.length} tables successfully.` }
  } catch (err) {
    return { success: false, message: `Import failed: ${err instanceof Error ? err.message : "Unknown error"}` }
  }
}

export default function SettingsPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [importResult, setImportResult] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

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

  return (
    <div>
      <h1 className="text-2xl font-display font-black accent-underline">Settings</h1>

      <div className="mt-6 space-y-6">
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

        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <h3 className="font-medium">About</h3>
              <Separator className="mt-2" />
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Version</span>
                <span className="tabular-nums">v0.4.0</span>
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
