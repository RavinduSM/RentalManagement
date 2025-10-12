import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Facility from "@/models/RoomFacility";

// Fetch all facilities (with pagination + search)
export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const search = searchParams.get("search") || "";

  const query: any = {isActive: true};
  if (search) query.name = { $regex: search, $options: "i" };

  const total = await Facility.countDocuments(query);
  const facilities = await Facility.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();

  return NextResponse.json({
    data: facilities,
    pagination: {
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
    },
  });
}

// Create a new facility
export async function POST(req: Request) {
  await dbConnect();
  try {
    const { name, description, price } = await req.json();

    if (!name)
      return NextResponse.json({ error: "Facility name is required" }, { status: 400 });

    // Check if a facility with the same name already exists
    const existing = await Facility.findOne({ name });
    if (existing)
      return NextResponse.json({ error: "Facility name already exists" }, { status: 409 });

    
    const facility = new Facility({ name, description, price });
    await facility.save();

    return NextResponse.json({
      message: "Facility created successfully",
      data: facility,
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

    const facility = await Facility.findById(id);
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
    const deleted = await Facility.findByIdAndUpdate(
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
