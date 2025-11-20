"use client"

import { Input } from "@/components/ui/input"
import { CategoryRead } from "@lib/api/orchestrator"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { LabelSelector } from "./label-selector"
import { FieldWithLabel } from "./mission-builder-utils"

export function CategorySelector({
    existingCategories = [],
    categories,
    header,
    label,
    required,
    onChangeValue,
    allowCreate = false,
    onCreateCategory,
}: {
    existingCategories?: CategoryRead[]
    categories: CategoryRead[]
    header?: React.ReactNode
    label?: string
    required?: boolean
    onChangeValue?: (selected: { id: string; label: string }[]) => void
    allowCreate?: boolean
    onCreateCategory?: (name: string) => Promise<CategoryRead | null>
}) {
    const [newCategoryName, setNewCategoryName] = useState("")
    const [creating, setCreating] = useState(false)
    const [localCategories, setLocalCategories] = useState<CategoryRead[]>(categories)
    const [internalSelectedItems, setInternalSelectedItems] = useState<
        { id: string; label: string }[]
    >([])

    useEffect(() => {
        setLocalCategories(categories)
    }, [categories])

    const choices = useMemo(
        () =>
            localCategories
                .map((category) => ({
                    id: category.id,
                    label: category.name ?? category.description ?? category.id,
                }))
                .filter((choice) => choice.label !== ""),
        [localCategories],
    )

    // Derive selected items from existingCategories + any internally added items
    const selectedItems = useMemo(() => {
        const fromExisting = existingCategories.map((category) => ({
            id: category.id,
            label: category.name ?? category.description ?? category.id,
        }))
        
        // Merge with internal items (from newly created categories)
        const merged = [...fromExisting]
        for (const item of internalSelectedItems) {
            if (!merged.some((m) => m.id === item.id)) {
                merged.push(item)
            }
        }
        return merged
    }, [existingCategories, internalSelectedItems])

    const handleSelectionChange = (selected: { id: string; label: string }[]) => {
        setInternalSelectedItems(selected)
        onChangeValue?.(selected)
    }

    const handleCreateCategory = async () => {
        const trimmed = newCategoryName.trim()
        if (!trimmed) {
            toast.error("Category name is required")
            return
        }
        if (!onCreateCategory) {
            toast.error("Creation handler not provided")
            return
        }
        setCreating(true)
        try {
            const created = await onCreateCategory(trimmed)
            if (!created) {
                return
            }
            setLocalCategories((prev) => [...prev, created])
            const createdOption = {
                id: created.id,
                label: created.name ?? created.description ?? created.id,
            }
            const newSelection = [...selectedItems, createdOption]
            setInternalSelectedItems(newSelection)
            onChangeValue?.(newSelection)
            setNewCategoryName("")
        } catch (error) {
            toast.error(
                `Failed to create category: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            )
        } finally {
            setCreating(false)
        }
    }

    return (
        <FieldWithLabel label={label} required={required}>
            {header}
            <LabelSelector
                defaultSelected={selectedItems}
                choices={choices}
                onChangeValue={handleSelectionChange}
            />
            {allowCreate && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Input
                        placeholder="New category name"
                        value={newCategoryName}
                        onChange={(event) => setNewCategoryName(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.preventDefault()
                                if (!creating && newCategoryName.trim()) {
                                    handleCreateCategory()
                                }
                            }
                        }}
                        className="w-56"
                        disabled={creating}
                    />
                </div>
            )}
        </FieldWithLabel>
    )
}
