# Evaluation Report

## Voice Performance
- Latency: ~2–3 seconds per response
- Task completion: able to handle intro, Q&A, availability, booking (partial)
- End-to-end call flow tested using Vapi outbound calls

## Chat Groundedness
- RAG used over resume + GitHub
- Hallucination rate: low
- Model refuses unknown info correctly

## Failure Modes

### 1. Generic answers for GitHub
Fix: Improved structured repo summaries

### 2. Model said "AI assistant"
Fix: Updated system prompt to enforce persona identity

### 3. Incorrect sources in booking responses
Fix: Separated calendar responses from RAG sources

## Improvements (2 weeks)
- Better retrieval ranking
- Multi-turn memory
- Improved voice latency
- More robust booking validation
