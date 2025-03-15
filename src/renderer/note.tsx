import React from "react";
import { createRoot } from "react-dom/client";
import NoteWindow from "./components/NoteWindow";
import "./styles/main.css";

const container = document.getElementById("note-root");
const root = createRoot(container!);
root.render(<NoteWindow />);
