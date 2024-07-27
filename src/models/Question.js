import mongoose from "mongoose";

export const QuestionSchema = new mongoose.Schema({
  _class: String,
  id: String,
  assessment_type: String,
  prompt: {
    question: String,
    relatedLectureIds: String,
    feedbacks: [String],
    explanation: String,
    answers: [String]
  },
  correct_response: [String],
  section: String,
  question_plain: String,
  related_lectures: [String],
  used: { type: Boolean, default: false },
  fileOrigin: String
});

export default mongoose.models.Question || mongoose.model("Question", QuestionSchema);
