import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Question from "@/models/Question";
import AdminKey from "@/models/AdminKey";

const extractAnswerLetter = (htmlString) => {
  const match = htmlString.match(/<p>\s*([A-Z])\)/i);
  return match ? match[1].toLowerCase() : null;
};

export async function POST(request) {
  await dbConnect();

  const { id, answers, adminKey } = await request.json();
  const isAdmin = await AdminKey.findOne({ key: adminKey });

  if (!isAdmin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const question = await Question.findOne({ id });

  if (!question) {
    return NextResponse.json({ message: "Question not found" }, { status: 404 });
  }

  try {
    const normalizedCorrectResponses = question.correct_response.map((resp) => resp.toLowerCase());
    const extractedAnswerLetters = answers.map(extractAnswerLetter);

    const correct =
      question.assessment_type === "multiple-choice"
        ? normalizedCorrectResponses.includes(extractedAnswerLetters[0])
        : JSON.stringify(normalizedCorrectResponses.sort()) === JSON.stringify(extractedAnswerLetters.sort());

    return NextResponse.json({ correct });
  } catch (error) {
    console.error("Error processing the answer:", error);
    return NextResponse.json({ message: "Error processing the answer", error }, { status: 500 });
  }
}
