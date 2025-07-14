"use client"

import { CategoryRead } from "@lib/api/orchestrator"
import { LabelSelector } from "./label-selector"
import { FieldWithLabel } from "./mission-builder-utils"

export function CategorySelector({
  existingCategories = [],
  categories,
  header,
  label,
  required,
  onChangeValue,
}: {
  existingCategories?: CategoryRead[]
  categories: CategoryRead[]
  header?: React.ReactNode
  label?: string
  required?: boolean
  onChangeValue?: (selected: { id: string; label: string }[]) => void
}) {
  const choices = categories
    .map(category => ({
      id: category.id,
      label: category.name ?? category.description ?? category.id,
    }))
    .filter(choice => choice.label !== "")
  return (
    <FieldWithLabel label={label} required={required}>
      {header}
      <LabelSelector
        defaultSelected={existingCategories.map(category => ({
          id: category.id,
          label: category.name ?? category.description ?? category.id,
        }))}
        choices={choices}
        onChangeValue={onChangeValue}
      />
    </FieldWithLabel>
  )
}
