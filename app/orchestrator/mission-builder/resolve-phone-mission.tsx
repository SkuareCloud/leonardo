"use client"

import { DateTimePicker } from "@/components/date-time-picker"
import { Dropzone } from "@/components/dropzone"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import { CategoryRead } from "@lib/api/orchestrator"
import { ChevronDown } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { CategorySelector } from "./category-selector"
import { MissionBuilderContext } from "./mission-builder-context"
import { FieldWithLabel, InputWithLabel } from "./mission-builder-utils"

export function ResolvePhoneMissionBuilder({
  categories,
}: {
  categories: CategoryRead[]
}) {
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [charactersCategories, setCharactersCategories] = useState<{ id: string; label: string }[]>([])

  const [batchSize, setBatchSize] = useState<number | string>(20)
  const [batchInterval, setBatchInterval] = useState<number | string>(10)
  const [timeBetweenScenarios, setTimeBetweenScenarios] = useState<number | string>(5)
  const [maxPhonesPerScenario, setMaxPhonesPerScenario] = useState<number | string>(50)
  const [startTime, setStartTime] = useState<Date | undefined>(() => {
    const now = new Date()
    const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000)
    utcNow.setMilliseconds(0)
    return utcNow
  })
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

  const { onChangeMissionPayload } = useContext(MissionBuilderContext)

  const activeCharacterCategories = categories.filter(c => (c.character_count ?? 0) > 0)

  const onUploadCsv = async (files: File[]) => {
    if (!files || files.length === 0) return
    setCsvFile(files[0])
  }

  useEffect(() => {
    const payload: any = {}
    if (csvFile) payload.csv_file = csvFile
    payload.characters_categories = charactersCategories.length > 0 ? charactersCategories.map(c => c.label) : []
    payload.batch_size = typeof batchSize === "string" ? Number(batchSize) || 20 : batchSize
    payload.batch_interval = typeof batchInterval === "string" ? Number(batchInterval) || 10 : batchInterval
    payload.time_between_scenarios = typeof timeBetweenScenarios === "string" ? Number(timeBetweenScenarios) || 5 : timeBetweenScenarios
    payload.max_phones_per_scenario = typeof maxPhonesPerScenario === "string" ? Number(maxPhonesPerScenario) || 50 : maxPhonesPerScenario
    payload.start_time = startTime
      ? new Date(startTime.getTime() - startTime.getTimezoneOffset() * 60000).toISOString()
      : new Date().toISOString()
    onChangeMissionPayload(payload)
  }, [csvFile, charactersCategories, batchSize, batchInterval, timeBetweenScenarios, maxPhonesPerScenario, startTime])

  return (
    <div className="flex flex-col gap-6 p-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6 max-w-lg">
          <FieldWithLabel label="Upload CSV" required>
            <div className="w-64">
              <Dropzone onUpload={onUploadCsv} accept={{ "text/csv": [".csv"] }} size="tiny" />
            </div>
            <div className="text-xs text-gray-500 mt-2">
              CSV must contain a list of phone numbers (one per row).
            </div>
            {csvFile && (
              <div className="text-xs text-gray-600 mt-1">Selected: {csvFile.name}</div>
            )}
          </FieldWithLabel>

          <FieldWithLabel label="Characters categories" required>
            <CategorySelector
              categories={activeCharacterCategories}
              label=""
              onChangeValue={value => setCharactersCategories(value)}
            />
          </FieldWithLabel>
        </div>

        <div className="flex flex-col gap-6 max-w-lg">
          <FieldWithLabel label="Max phones per scenario" required>
            <InputWithLabel
              label=""
              type="number"
              min="1"
              value={maxPhonesPerScenario}
              onBlur={e => {
                const value = Number(e.target.value)
                if (e.target.value === "" || value <= 0 || isNaN(value)) setMaxPhonesPerScenario(50)
              }}
              onChange={e => setMaxPhonesPerScenario(e.target.value)}
              className="w-40"
            />
          </FieldWithLabel>

          <FieldWithLabel label="Time between scenarios (minutes)" required>
            <InputWithLabel
              label=""
              type="number"
              min="0"
              value={timeBetweenScenarios}
              onBlur={e => {
                const value = Number(e.target.value)
                if (e.target.value === "" || value < 0 || isNaN(value)) setTimeBetweenScenarios(5)
              }}
              onChange={e => setTimeBetweenScenarios(e.target.value)}
              className="w-40"
            />
          </FieldWithLabel>
        </div>
      </div>

      <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 cursor-pointer hover:opacity-80">
          <Label className="text-base font-semibold">Advanced Settings</Label>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isAdvancedOpen ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            
            <FieldWithLabel label="Start time" required>
              <div className="flex flex-col gap-3 w-full">
                <div className="flex flex-row gap-2 items-center">
                  <DateTimePicker
                    resetable
                    onSelectDate={(value: Date) => {
                      value.setMilliseconds(0)
                      setStartTime(value)
                    }}
                  />
                </div>
              </div>
            </FieldWithLabel>
            
            <InputWithLabel
              label="Batch size"
              type="number"
              min="1"
              value={batchSize}
              onBlur={e => {
                const value = Number(e.target.value)
                if (e.target.value === "" || value <= 0 || isNaN(value)) setBatchSize(20)
              }}
              onChange={e => setBatchSize(e.target.value)}
              className="w-32"
            />
            <InputWithLabel
              label="Batch interval (minutes)"
              type="number"
              min="1"
              value={batchInterval}
              onBlur={e => {
                const value = Number(e.target.value)
                if (e.target.value === "" || value <= 0 || isNaN(value)) setBatchInterval(10)
              }}
              onChange={e => setBatchInterval(e.target.value)}
              className="w-32"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}


