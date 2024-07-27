import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

import { QuestionSchema } from "../src/models/Question.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const Question = mongoose.model("Question", QuestionSchema);

async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }
  await mongoose.connect(MONGODB_URI);
}

async function importQuestions() {
  await dbConnect();

  const dataDirectory = path.join(__dirname, "..", "data");
  const files = fs.readdirSync(dataDirectory);

  for (const file of files) {
    if (path.extname(file) === ".json") {
      const filePath = path.join(dataDirectory, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const jsonData = JSON.parse(fileContent);
      const questions = jsonData.results || jsonData;

      for (const question of questions) {
        question.id = `${question.id}_${file}`;

        const newQuestion = new Question({
          ...question,
          fileOrigin: file,
          used: false
        });
        await newQuestion.save();
      }

      console.log(`Imported questions from ${file}`);
    }
  }

  console.log("All questions imported successfully");
  await mongoose.connection.close();
}

importQuestions().catch(console.error);
