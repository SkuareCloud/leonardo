"use client"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CategoryRead } from "@lib/api/orchestrator/types.gen"
import { PlusCircleIcon, TrashIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface CategoryManagementDialogProps {
  categories: CategoryRead[]
  onCategoryCreated: (category: CategoryRead) => void
  onCategoryDeleted: (categoryId: string) => void
  trigger?: React.ReactNode
}

export function CreateCategoryDialog({ 
  categories, 
  onCategoryCreated, 
  onCategoryDeleted,
  trigger 
}: CategoryManagementDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [parentId, setParentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryRead | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error("Category name is required")
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/orchestrator/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          parent_id: parentId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create category')
      }

      const newCategory = await response.json()
      onCategoryCreated(newCategory)
      
      // Reset form
      setName("")
      setDescription("")
      setParentId(null)
      setOpen(false)
      
      toast.success(`Successfully created category: ${newCategory.name}`)
    } catch (error) {
      console.error('Failed to create category:', error)
      toast.error(`Failed to create category: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return
    
    setDeleteLoading(true)
    
    try {
      const response = await fetch(`/api/orchestrator/categories?id=${categoryToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete category')
      }

      onCategoryDeleted(categoryToDelete.id)
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
      
      toast.success(`Successfully deleted category: ${categoryToDelete.name}`)
    } catch (error) {
      console.error('Failed to delete category:', error)
      toast.error(`Failed to delete category: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDeleteClick = (category: CategoryRead) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2"
            >
              <PlusCircleIcon className="h-4 w-4 mr-1" />
              New Category
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Create Category Form */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">Create New Category</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter category name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter category description (optional)"
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="parent">Parent Category</Label>
                  <Select value={parentId || undefined} onValueChange={setParentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null as any}>None (Root level)</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Creating..." : "Create Category"}
                </Button>
              </form>
            </div>

            {/* Existing Categories */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">Existing Categories</h3>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No categories found</p>
                ) : (
                  categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{category.name}</div>
                        {category.description && (
                          <div className="text-sm text-muted-foreground">
                            {category.description}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Chats: {category.chat_count || 0} | Characters: {category.character_count || 0}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(category)}
                        disabled={deleteLoading}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category "{categoryToDelete?.name}". 
              This action cannot be undone.
              {(categoryToDelete?.chat_count || 0) > 0 && (
                <div className="mt-2 text-orange-600">
                  Warning: This category has {categoryToDelete?.chat_count} chat(s) assigned to it.
                </div>
              )}
              {(categoryToDelete?.character_count || 0) > 0 && (
                <div className="mt-2 text-orange-600">
                  Warning: This category has {categoryToDelete?.character_count} character(s) assigned to it.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 