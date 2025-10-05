// app/api/tenants/route.ts   👈 renamed to plural
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tenant from "@/models/Tenant";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    const { fullName, callingName, nicNo, contactNo, address, joinedDate } = body;

    const tenant = await Tenant.create({
      fullName,
      callingName,
      nicNo,
      contactNo,
      address,
      joinedDate,
    });

    return NextResponse.json(
      { message: "Tenant added successfully", tenant: tenant.decryptData() },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Add tenant error:", error);

    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      return NextResponse.json({ error: `${duplicateField} already exists` }, { status: 400 });
    }

    return NextResponse.json({ error: "Something went wrong", details: error.message }, { status: 500 });
  }
}
// Get tenants with pagination and search
export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10);
    const search = url.searchParams.get("search")?.trim() || "";

    const skip = (page - 1) * pageSize;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { contactNo: { $regex: search, $options: "i" } },
        { nicNo: { $regex: search, $options: "i" } },
      ];
    }

    const totalRecords = await Tenant.countDocuments(filter);

    const tenants = await Tenant.find(filter).skip(skip).limit(pageSize);
    const decrypted = tenants.map((t) => t.decryptData());

    return NextResponse.json({
      data: decrypted,
      pagination: {
        total: totalRecords,
        currentPage: page,
        pageSize,
        totalPages: Math.ceil(totalRecords / pageSize),
      },
    });
  } catch (error: any) {
    console.error("Get tenants error:", error);
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}

// Update tenant (enable/disable or edit)
export async function PATCH(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id"); // _id or tenantId
  const action = searchParams.get("action"); // "enable" | "disable"

  if (!id) {
    return NextResponse.json({ error: "Tenant ID is required" }, { status: 400 });
  }

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const update: any = { ...body };

    if (action === "disable") update.isActive = false;
    if (action === "enable") update.isActive = true;

    let tenant = null;

    // Use $set to ensure hooks trigger correctly
    if (mongoose.Types.ObjectId.isValid(id)) {
      tenant = await Tenant.findByIdAndUpdate(id, { $set: update }, { new: true });
    }
    if (!tenant) {
      tenant = await Tenant.findOneAndUpdate({ tenantId: id }, { $set: update }, { new: true });
    }

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Tenant updated successfully",
      tenant: tenant.decryptData(),
    });
  } catch (err: any) {
    console.error("Update tenant error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

