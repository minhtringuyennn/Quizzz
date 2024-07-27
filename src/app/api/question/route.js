import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Question from "@/models/Question";
import AdminKey from "@/models/AdminKey";

export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const adminKey = searchParams.get("adminKey");
  
  const isAdmin = await AdminKey.findOne({ key: adminKey });

  if (!isAdmin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const question = await Question.findOne({ used: false }).sort({ _id: 1 });

  if (question) {
    question.used = true;
    await question.save();
    if (global.setAndEmitCurrentQuestion) {
      global.setAndEmitCurrentQuestion(question);
    }
    return NextResponse.json(question);
  } else {
    return NextResponse.json({ message: "No more questions available" }, { status: 404 });
  }
}
