# AI Persona – Syeda Noorain

## Overview

This project implements an AI-powered persona that can represent me in both chat and voice interfaces. The system is capable of answering questions about my background, projects, and skills using retrieval-augmented generation (RAG), as well as assisting with interview scheduling using my real calendar.

The goal of this project is to demonstrate the ability to build a production-style AI system that integrates LLMs, external data sources, and real-world tools such as calendar APIs and telephony.

---

## Features

### Chat Interface

* Answers questions about my:

  * Resume (education, experience, skills)
  * GitHub projects (tech stack, purpose, tradeoffs)
* Uses RAG over structured data (resume + GitHub)
* Avoids hallucinations and stays grounded
* Supports booking interview slots directly from chat

### Voice Agent

* Built using Vapi + Twilio
* Introduces itself as my AI representative
* Handles conversational Q&A about my profile
* Supports basic interaction flow via phone calls

> Note: Due to telephony and voice platform constraints (Twilio + Vapi usage costs and trial limitations), the voice agent is configured primarily for demonstration and testing. It supports core conversational capabilities but is not fully scaled for unrestricted public calling.

### Scheduling & Booking

* Integrates with Google Calendar
* Generates real-time availability
* Books meetings end-to-end
* Confirms bookings conversationally

---

## Architecture

Frontend (React)
→ Backend (Node.js / Express)
→ RAG Layer (Resume + GitHub retrieval)
→ Calendar Service (Google Calendar API)
→ Voice Layer (Vapi + Twilio)
→ LLM (Groq)

---

## Tech Stack

* **Frontend:** React (Vite)
* **Backend:** Node.js, Express
* **LLM:** Groq
* **RAG:** Custom retriever over resume and GitHub data
* **Voice:** Vapi, Twilio
* **Calendar:** Google Calendar API

---

## How It Works

1. User asks a question (chat or voice)
2. Backend retrieves relevant context (resume / GitHub)
3. LLM generates a grounded response
4. For scheduling:

   * Availability is fetched from calendar
   * Booking is validated and created
5. Voice calls are handled through Vapi orchestration

---

## Setup Instructions

### Backend

```
npm install
npm run dev
```

### Frontend

```
npm install
npm run dev
```

---

## Demo

* Chat Interface: https://scaler-persona-iota.vercel.app/
* Voice Agent: Configured via Twilio + Vapi (tested using outbound calls)

---

## Limitations

* Voice agent is tested using Twilio trial and Vapi free credits
* Incoming public calls may be restricted due to telephony limitations
* Voice booking flow is partially implemented and focused on demo scenarios

---

## Evaluation Summary

* Chat responses are grounded and context-aware
* Low hallucination observed in testing
* Booking flow works reliably in chat interface
* Voice flow validated for basic conversational use

---

## Future Improvements

* Full production voice deployment without trial limitations
* Improved retrieval ranking and context compression
* Multi-turn conversational memory
* Better handling of edge cases in scheduling

---

## Conclusion

This project demonstrates an end-to-end AI system that integrates LLMs, real-world data, and external APIs to simulate a functional AI persona capable of interacting, answering, and scheduling autonomously.
