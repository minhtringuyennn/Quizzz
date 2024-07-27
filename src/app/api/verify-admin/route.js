import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import AdminKey from "@/models/AdminKey";

export async function POST(request) {
  await dbConnect();
  const { adminKey } = await request.json();

  const isAdmin = await AdminKey.findOne({ key: adminKey });

  if (isAdmin) {
    return NextResponse.json({ isAdmin: true });
  } else {
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }
}
