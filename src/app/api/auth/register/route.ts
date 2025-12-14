import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import dbConnect from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { userName, email, password, firstName, lastName } = await req.json();

    if (!userName || !email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const emailExists = await User.findOne({ email });
    const userNameExists = await User.findOne({ userName });

    if (emailExists && userNameExists) {
      return NextResponse.json(
        { message: "Email and username already exist" },
        { status: 409 }
      );
    }

    if (emailExists) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 409 }
      );
    }

    if (userNameExists) {
      return NextResponse.json(
        { message: "Username already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      userName,
      email,
      password: hashedPassword,
      firstName, 
      lastName
    });

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
