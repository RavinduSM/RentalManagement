import dbConnect from "@/lib/mongodb";
import Building from "@/models/Building";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");
    const name = searchParams.get("name");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    // Build dynamic filter
    const filter: Record<string, any> = {};
    if (id) filter.buildingId = { $regex: id, $options: "i" };
    if (name) filter.name = { $regex: name, $options: "i" };

    // Count total documents
    const total = await Building.countDocuments(filter);

    // Fetch paginated buildings
    const buildings = await Building.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      buildings,
    });
  } catch (err) {
    console.error("Error fetching buildings:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
