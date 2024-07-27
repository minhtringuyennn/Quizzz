import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

let currentQuestion = null;
let currentPollCount = {};
let currentResult = null;

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log("A user connected");

    if (currentQuestion) {
      socket.emit("currentQuestion", currentQuestion);
      socket.emit("updatePoll", currentPollCount);
      if (currentResult !== null) {
        socket.emit("quizResult", currentResult);
      }
    }

    socket.on("vote", ({ questionId, answer }) => {
      if (currentQuestion && currentQuestion.id === questionId) {
        if (!currentPollCount[answer]) {
          currentPollCount[answer] = 0;
        }
        currentPollCount[answer]++;
        io.emit("updatePoll", currentPollCount);
      }
    });

    socket.on("submitResult", (result) => {
      currentResult = result;
      io.emit("quizResult", result);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });

  const setAndEmitCurrentQuestion = (question) => {
    currentQuestion = question;
    currentPollCount = {};
    currentResult = null;
    question.prompt.answers.forEach((answer) => {
      currentPollCount[answer] = 0;
    });
    io.emit("currentQuestion", question);
    io.emit("updatePoll", currentPollCount);
  };

  global.setAndEmitCurrentQuestion = setAndEmitCurrentQuestion;

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log("> Ready on http://localhost:3000");
  });
});
