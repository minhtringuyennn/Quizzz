"use client";

import { useState, useEffect } from "react";
import io from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bar, BarChart, XAxis, YAxis, LabelList } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

let socket;

const chartConfig = {
  number: {
    label: "count",
    color: "hsl(var(--chart-1))"
  }
};

export default function Quiz({ isAdmin }) {
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [result, setResult] = useState(null);
  const [poll, setPoll] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socketInitializer();
  }, []);

  useEffect(() => {
    if (isAdmin && isConnected) {
      fetchNextQuestion();
    }
  }, [isAdmin, isConnected]);

  const socketInitializer = async () => {
    socket = io({
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socket.on("connect", () => {
      console.log("Connected to socket");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket. Attempting to reconnect...");
      setIsConnected(false);
    });

    socket.on("reconnect_attempt", () => {
      console.log("Reconnection attempt...");
    });

    socket.on("currentQuestion", (newQuestion) => {
      setQuestion(newQuestion);
      setSelectedAnswer(null);
      setResult(null);
      setPoll({});
      setHasSubmitted(false);
    });

    socket.on("updatePoll", (updatedPoll) => {
      setPoll(updatedPoll);
    });

    socket.on("quizResult", (quizResult) => {
      setResult(quizResult.correct);
    });
  };

  const fetchNextQuestion = async () => {
    if (!isAdmin) return;
    console.log("Fetching next question");

    const res = await fetch(`/api/question?adminKey=${localStorage.getItem("adminKey")}`);
    const data = await res.json();
    if (res.ok) {
      console.log("Fetched next question", data);
      setQuestion(data);
      setSelectedAnswer(null);
      setResult(null);
      setPoll({});
      setHasSubmitted(false);
    } else {
      console.error("Failed to fetch next question:", data.message);
    }
  };

  const handleAnswer = (answer) => {
    if (hasSubmitted) return;
    setSelectedAnswer(answer);
  };

  const submitAnswer = async () => {
    if (!selectedAnswer) return;

    if (socket.connected) {
      socket.emit("vote", { questionId: question.id, answer: selectedAnswer });
    } else {
      console.error("Socket is not connected. Trying to reconnect...");
      socket.connect();
      socket.emit("vote", { questionId: question.id, answer: selectedAnswer });
    }
    setHasSubmitted(true);

    if (isAdmin) {
      const res = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: question.id, answers: [selectedAnswer], adminKey: localStorage.getItem("adminKey") })
      });
      const data = await res.json();
      setResult(data.correct);
      if (socket.connected) {
        socket.emit("submitResult", { correct: data.correct, correctResponse: question.correct_response });
      } else {
        console.error("Socket is not connected. Trying to reconnect...");
        socket.connect();
        socket.emit("submitResult", { correct: data.correct, correctResponse: question.correct_response });
      }
    }
  };

  if (!isConnected) return <div>Connecting to server...</div>;
  if (!question) return <div>Waiting for question...</div>;

  const pollData = Object.entries(poll || {}).map(([answer, count], index) => ({
    answer: String.fromCharCode(65 + index),
    count
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 self-start">
      <div>
        <h1 className="text-2xl font-bold mb-4">Quiz type {question.assessment_type}</h1>
        <h2 className="text-xl mb-8" dangerouslySetInnerHTML={{ __html: question.prompt.question }}></h2>
        <div className="space-y-2 flex flex-col overflow-x-auto">
          {question.prompt.answers.map((answer, index) => (
            <Button
              key={index}
              onClick={() => handleAnswer(answer)}
              className={`w-fit h-fit text-pretty text-ellipsis p-4 text-left ${
                selectedAnswer === answer ? "bg-blue-500 text-white" : ""
              } hover:bg-primary/70`}
              dangerouslySetInnerHTML={{ __html: answer }}
            ></Button>
          ))}
        </div>
        {!hasSubmitted && selectedAnswer && (
          <Button onClick={submitAnswer} className="mt-4 p-2 bg-green-500 text-white">
            Submit Answer
          </Button>
        )}
      </div>
      <div>
        {poll && (
          <div>
            <h2 className="text-lg font-bold">Poll Results</h2>
            <Card className="bg-foreground p-4 mt-4">
              <ChartContainer config={chartConfig}>
                <BarChart
                  accessibilityLayer
                  data={pollData}
                  layout="vertical"
                  margin={{
                    right: 20
                  }}
                >
                  <XAxis type="number" dataKey="count" hide />
                  <YAxis dataKey="answer" type="category" tickLine={false} tickMargin={10} axisLine={false} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="count" fill="var(--color-desktop)" radius={5}>
                    <LabelList position="right" offset={12} className="text-black" fontSize={12} />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </Card>
          </div>
        )}
        {result !== null && (
          <div className="mt-8 overflow-x-auto">
            <p>{result ? "Correct!" : `Incorrect. The correct answer is: ${question.correct_response.join(", ")}`}</p>
            <h2 className="text-md" dangerouslySetInnerHTML={{ __html: question.prompt.explanation }}></h2>
            {isAdmin && (
              <Button onClick={fetchNextQuestion} className="mt-4 p-2 bg-blue-500 text-white">
                Next Question
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
