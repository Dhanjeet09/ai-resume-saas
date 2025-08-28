import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectToMongoDB from "@/lib/mongodb"; // ✅ default import
import { cloudinary } from "@/lib/cloudinary";
import pdf from "pdf-parse";
import mammoth from "mammoth"; // for DOCX
import { Buffer } from "buffer";
import Resume from "@/models/Resume";

export const maxDuration = 60;

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("resume");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const allowedTypes = new Set([
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
      "text/plain",
    ]);

    // fallback if file.type is missing
    const mimeType =
      file.type ||
      (file.name?.endsWith(".pdf")
        ? "application/pdf"
        : file.name?.endsWith(".docx")
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : file.name?.endsWith(".txt")
        ? "text/plain"
        : "");

    if (!allowedTypes.has(mimeType)) {
      return NextResponse.json(
        { error: "Unsupported file format" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "raw",
            folder: `ai-resume-saas/${session.user.email}`, // ✅ safer: use email as unique id
            public_id: `${Date.now()}-${(file.name || "resume").replace(
              /\s+/g,
              "_"
            )}`,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    // Extract text
    let resumeText = "";
    if (mimeType === "application/pdf") {
      const pdfData = await pdf(buffer);
      resumeText = pdfData.text || "";
    } else if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const docxData = await mammoth.extractRawText({ buffer });
      resumeText = docxData.value || "";
    } else if (mimeType === "text/plain") {
      resumeText = buffer.toString("utf-8");
    }

    // Save to MongoDB (Mongoose model)
    await connectToMongoDB();
    const resumeDoc = await Resume.create({
      userId: session.user.email, // ✅ consistent id
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      originalName: file.name || "resume",
      fileType: mimeType,
      size: file.size || buffer.length,
      extractedText: resumeText,
    });

    return NextResponse.json({
      success: true,
      resumeId: resumeDoc._id.toString(),
      extractedText: resumeText,
      fileUrl: uploadResult.secure_url,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

// GET → return user’s resumes
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToMongoDB();
    const resumes = await Resume.find({ userId: session.user.email }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ success: true, resumes });
  } catch (error) {
    console.error("Fetching resumes failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch resumes" },
      { status: 500 }
    );
  }
}
