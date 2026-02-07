# Architecture - Adapt

AdaptIQ is an AI-powered PowerPoint add-in that helps presenters adapt their slides in real time based on audience engagement and presenter cues. During a presentation, AdaptIQ monitors live signals—such as pauses, questions, and speech patterns—to infer whether the audience is engaged, confused, or losing focus. It then provides clear, actionable suggestions directly inside PowerPoint, like adding an example slide, simplifying content, or skipping ahead, and allows presenters to apply these changes instantly with one click. The goal is to make presentations more responsive, clear, and effective without disrupting the presenter’s flow.

Powerpoint Add-In(nextjs)

Audio signals

Real-Time siggustions

One-click slide Action

Whole Tech:
-Next.js
-Office.js
-webaudio API
-OpenAI

Flow: (Speech-to-text)

1. web audio Api -> audio.ts

2. audio chunk sent to backend

3. Whisper(open AI) -> transcript (inside analyze/route.s)

4. Transcript + slidetext -> gpt

5. gpt returns engagement + suggestion

lib/ai.ts -> prompt logic

SideBar : start listening

AdaptIq is a Powerpoint Add-in. users install it once and then it appears inside powerpoint as a sidebar they can open during any presentation

TTS: Read suggesstion out loud
