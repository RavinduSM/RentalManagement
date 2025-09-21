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

    // Filter to only include active buildings
    const filter: Record<string, any> = { isActive: true };

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

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();

    if (!body.name || !body.location) {
      return NextResponse.json(
        { error: "Name and location are required" },
        { status: 400 }
      );
    }

    // Create new building (buildingId will be auto-generated in schema)
    const newBuilding = new Building({
      name: body.name,
      location: body.location,
      isActive: true
    });

    await newBuilding.save();

    return NextResponse.json(newBuilding, { status: 201 });
  } catch (err) {
    console.error("Error creating building:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id"); // can be _id or buildingId

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    let deletedBuilding;

    // Try finding by MongoDB _id first
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      deletedBuilding = await Building.findByIdAndUpdate(
        id,
        { $set: { isActive: false } },
        { new: true }
      );
    }

    // If not found by _id, fall back to buildingId
    if (!deletedBuilding) {
      deletedBuilding = await Building.findOneAndUpdate(
        { buildingId: id },
        { $set: { isActive: false } },
        { new: true }
      );
    }

    if (!deletedBuilding) {
      return NextResponse.json({ error: "Building not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Building deactivated successfully",
      building: deletedBuilding,
    });
  } catch (err) {
    console.error("Error deleting building:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
