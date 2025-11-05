import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import MainMeter from "@/models/mainMeterModel";

// Fetch all facilities (with pagination + search)
export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const search = searchParams.get("search") || "";

  const query: any = {isActive: true};
  if (search) query.name = { $regex: search, $options: "i" };

  const total = await MainMeter.countDocuments(query);
  const mainMeter = await MainMeter.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();

  return NextResponse.json({
    data: mainMeter,
    pagination: {
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
    },
  });
}

// Create a new meter
export async function POST(req: Request) {
  await dbConnect();
  try {
    const { buildingId, meterType, meterNo, installedAt } = await req.json();

    if (!buildingId)
      return NextResponse.json({ error: "Building is required" }, { status: 400 });

    if (!meterType)
        return NextResponse.json({ error: "meterType is required" }, { status: 400 });

    if (!meterNo)
        return NextResponse.json({ error: "meterNo is required" }, { status: 400 });

        
    const meter = new MainMeter({  buildingId, meterType, meterNo, installedAt });
    await meter.save();

    return NextResponse.json({
      message: "Meter created successfully",
      data: meter,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Update facility details or enable/disable
export async function PATCH(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Missing facility id" }, { status: 400 });

  try {
    const body = await req.json();

    const facility = await MainMeter.findById(id);
    if (!facility) return NextResponse.json({ error: "Facility not found" }, { status: 404 });

    if (body.name) facility.name = body.name;
    if (body.description) facility.description = body.description;
    if (body.price !== undefined) facility.price = Number(body.price);

    await facility.save();

    return NextResponse.json({ message: "Facility updated successfully", data: facility });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Delete a facility
export async function DELETE(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) 
    return NextResponse.json({ error: "Missing facility id" }, { status: 400 });

  try {
    const deleted = await MainMeter.findByIdAndUpdate(
      id,         
      { isActive: false },
      { new: true } 
    );

    if (!deleted)
      return NextResponse.json({ error: "Facility not found" }, { status: 404 });

    return NextResponse.json({ message: "Facility deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
