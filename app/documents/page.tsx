"use client"

import { FileUpload } from "@/components/ui/file-upload"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DocumentsPage() {
    const handleUpload = async (files: File[]) => {
        const formData = new FormData()
        files.forEach((file) => {
            formData.append("files", file)
        })

        const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        })

        if (!response.ok) {
            throw new Error("Upload failed")
        }
    }

    return (
        <div className="space-y-6 p-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
                <p className="text-muted-foreground">
                    Manage and upload your documents.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Upload Documents</CardTitle>
                        <CardDescription>
                            Upload files to your secure storage.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FileUpload onUpload={handleUpload} maxFiles={5} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Documents</CardTitle>
                        <CardDescription>
                            Your recently uploaded files.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground text-center py-8">
                            No documents found.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
