// app/api/tenant/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tenant from "@/models/Tenant";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    console.log("Body received:", body); // 🔹 debug

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
      {
        message: "Tenant added successfully",
        tenant: tenant.decryptData?.() || tenant,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Add tenant error:", error);

     if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      return NextResponse.json(
        { error: `${duplicateField} already exists` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    // Parse query params
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10);
    const search = url.searchParams.get("search")?.trim() || "";

    const skip = (page - 1) * pageSize;

    // Build search filter
    const filter: any = {};
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { contactNo: { $regex: search, $options: "i" } },
        { nicNo: { $regex: search, $options: "i" } },
      ];
    }

    // Get total count with filter
    const totalRecords = await Tenant.countDocuments(filter);

    // Fetch tenants with filter and pagination
    const tenants = await Tenant.find(filter)
      .skip(skip)
      .limit(pageSize);

    const decrypted = tenants.map((t) => t.decryptData());

    return NextResponse.json({
      data: decrypted,
      pagination: {
        total: totalRecords,
        currentPage: page,
        pageSize: pageSize,
        totalPages: Math.ceil(totalRecords / pageSize),
      },
    });
  } catch (error: any) {
    console.error("Get tenants error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

