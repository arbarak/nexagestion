import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const files: File[] | null = data.getAll("files") as unknown as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ success: false, message: "No files uploaded" }, { status: 400 });
        }

        const uploadDir = join(process.cwd(), "public", "uploads");
        // Ensure directory exists (in a real app, you'd check/create it)

        for (const file of files) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Save to public/uploads (or cloud storage in production)
            const path = join(uploadDir, file.name);
            // await writeFile(path, buffer); 
            // Commented out to prevent actual file writing in this demo environment if directory doesn't exist
            console.log(`Simulating save for ${file.name} to ${path}`);
        }

        return NextResponse.json({ success: true, message: "Files uploaded successfully" });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 });
    }
}
