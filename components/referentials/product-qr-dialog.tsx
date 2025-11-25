"use client"

import { QRCodeSVG } from "qrcode.react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface ProductQRDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    product: { id: string; name: string; code: string } | null
}

export function ProductQRDialog({
    open,
    onOpenChange,
    product,
}: ProductQRDialogProps) {
    if (!product) return null

    const qrValue = JSON.stringify({
        id: product.id,
        code: product.code,
        name: product.name,
    })

    const downloadQR = () => {
        const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement
        if (canvas) {
            const pngUrl = canvas
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream")
            const downloadLink = document.createElement("a")
            downloadLink.href = pngUrl
            downloadLink.download = `${product.code}-qr.png`
            document.body.appendChild(downloadLink)
            downloadLink.click()
            document.body.removeChild(downloadLink)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Product QR Code</DialogTitle>
                    <DialogDescription>
                        Scan this code to view product details.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center space-y-4 py-4">
                    <div className="p-4 bg-white rounded-lg border">
                        <QRCodeSVG
                            id="qr-code-svg"
                            value={qrValue}
                            size={200}
                            level={"H"}
                            includeMargin={true}
                        />
                    </div>
                    <div className="text-center">
                        <p className="font-bold">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.code}</p>
                    </div>
                    <Button onClick={() => window.print()} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Print / Save
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
