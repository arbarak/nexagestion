"use client"

import { useEffect, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Trash2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const saleItemSchema = z.object({
    productId: z.string().min(1, "Product is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.coerce.number().min(0, "Price must be positive"),
})

const saleSchema = z.object({
    clientId: z.string().min(1, "Client is required"),
    status: z.enum(["DRAFT", "QUOTE", "ORDER", "DELIVERY", "INVOICED", "PAID", "CANCELLED"]),
    items: z.array(saleItemSchema).min(1, "At least one item is required"),
})

type SaleFormValues = z.infer<typeof saleSchema>

interface SaleDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialData?: SaleFormValues & { id?: string }
    onSubmit: (data: SaleFormValues) => Promise<void>
    allowedStatuses?: ("DRAFT" | "QUOTE" | "ORDER" | "DELIVERY" | "INVOICED" | "PAID" | "CANCELLED")[]
}

export function SaleDialog({
    open,
    onOpenChange,
    initialData,
    onSubmit,
    allowedStatuses = ["DRAFT", "QUOTE", "ORDER", "DELIVERY", "INVOICED", "PAID", "CANCELLED"],
}: SaleDialogProps) {
    const [clients, setClients] = useState<{ id: string; name: string }[]>([])
    const [products, setProducts] = useState<{ id: string; name: string; price: number }[]>([])

    const form = useForm<SaleFormValues>({
        resolver: zodResolver(saleSchema),
        defaultValues: {
            clientId: "",
            status: "DRAFT",
            items: [{ productId: "", quantity: 1, unitPrice: 0 }],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    })

    useEffect(() => {
        if (open) {
            // Fetch clients and products
            fetch("/api/referentials/clients").then(res => res.json()).then(data => setClients(data.data || []))
            fetch("/api/referentials/products").then(res => res.json()).then(data => setProducts(data.data || []))

            if (initialData) {
                form.reset(initialData)
            } else {
                form.reset({
                    clientId: "",
                    status: "DRAFT",
                    items: [{ productId: "", quantity: 1, unitPrice: 0 }],
                })
            }
        }
    }, [open, initialData, form])

    const handleProductChange = (index: number, productId: string) => {
        const product = products.find(p => p.id === productId)
        if (product) {
            form.setValue(`items.${index}.unitPrice`, Number(product.price))
        }
    }

    const handleSubmit = async (data: SaleFormValues) => {
        await onSubmit(data)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>
                        {initialData?.id ? "Edit Sale" : "Create New Sale"}
                    </DialogTitle>
                    <DialogDescription>
                        Create a new sale order or quote.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="clientId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Client</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a client" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {clients.map((client) => (
                                                    <SelectItem key={client.id} value={client.id}>
                                                        {client.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {allowedStatuses.map((status) => (
                                                    <SelectItem key={status} value={status}>
                                                        {status}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium">Items</h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => append({ productId: "", quantity: 1, unitPrice: 0 })}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Item
                                </Button>
                            </div>

                            {fields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-12 gap-4 items-end border p-4 rounded-md">
                                    <div className="col-span-5">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.productId`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Product</FormLabel>
                                                    <Select
                                                        onValueChange={(value) => {
                                                            field.onChange(value)
                                                            handleProductChange(index, value)
                                                        }}
                                                        defaultValue={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select product" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {products.map((product) => (
                                                                <SelectItem key={product.id} value={product.id}>
                                                                    {product.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.quantity`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Quantity</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min="1" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.unitPrice`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Price</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min="0" step="0.01" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Saving..." : "Save"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
