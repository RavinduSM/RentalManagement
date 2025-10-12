import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";
import Room from "@/models/Room";
import Building from "@/models/Building";

//Fetch rooms 
export async function GET(req: Request) {
  await dbConnect();
  const { name, page = "1", pageSize = "10", buildingId } = Object.fromEntries(
    new URL(req.url).searchParams
  );

  const query: any = {};
  if (name) query.name = name;
  if (buildingId) query.buildingId = buildingId;

  const skip = (Number(page) - 1) * Number(pageSize);
  const total = await Room.countDocuments(query);
  const rooms = await Room.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(pageSize))
    .lean();

  return NextResponse.json({
    data: rooms,
    pagination: {
      total,
      totalPages: Math.ceil(total / Number(pageSize)),
      currentPage: Number(page),
    },
  });
}

// Create a new room
export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const { buildingId, name, description, facilities, basePrice } = body;

    if (!buildingId || !name || !description)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const buildingExists = await Building.findOne({ buildingId });
    if (!buildingExists)
      return NextResponse.json({ error: "Invalid buildingId" }, { status: 404 });

    const existingRoom = await Room.findOne({ buildingId, name });
    if (existingRoom)
      return NextResponse.json(
        { error: "Room with same name already exists in this building" },
        { status: 409 }
      );

    const newRoom = new Room({
      buildingId,
      name,
      description,
      facilities: Array.isArray(facilities) ? facilities : [],
      isActive: true,
      prices: [
        {
          price: basePrice || 0,
          startDate: new Date(),
          endDate: null,
        },
      ],
    });

    await newRoom.save();

    return NextResponse.json({
      message: "Room created successfully",
      data: newRoom,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


//  Update room details
export async function PATCH(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const action = searchParams.get("action");

  if (!id)
    return NextResponse.json({ error: "Missing room id" }, { status: 400 });

  try {
    
    const room = await Room.findById(id);
    if (!room)
      return NextResponse.json({ error: "Room not found" }, { status: 404 });

    // Handle enable/disable
    if (action === "enable" || action === "disable") {
      room.isActive = action === "enable";
      await room.save();
      return NextResponse.json({ message: `Room ${action}d successfully`, data: room });
    }

    // Handle normal update
    const body = await req.json();

    if (body.facilities) room.facilities = body.facilities;
    if (body.description) room.description = body.description;
    if (body.name) room.name = body.name;

    if (body.newPrice) {
      const currentPrice = room.prices.find((p) => !p.endDate);
      if (currentPrice) currentPrice.endDate = new Date();
      room.prices.push({
        price: body.newPrice,
        startDate: new Date(),
        endDate: null,
      });
    }

    await room.save();
    return NextResponse.json({ message: "Room updated successfully", data: room });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


