from fastapi import FastAPI, WebSocket
import asyncio
from openai import OpenAI
from elevenlabs import generate, stream

app = FastAPI()
client = OpenAI(api_key="YOUR_OPENAI_API_KEY")

@app.websocket("/ws/translate")
async def speech_to_speech(websocket: WebSocket):
    await websocket.accept()
    
    try:
        while True:
            # Receive audio chunk from Frontend
            data = await websocket.receive_bytes()
            
            # 1. Transcribe (Whisper)
            # Note: In a hackathon, use 'whisper-1' for speed
            transcript = client.audio.transcriptions.create(
                model="whisper-1", 
                file=("audio.wav", data),
                prompt="The speaker has a stutter or dysarthria, please correct for clarity."
            )
            
            # Send text back to UI for real-time visual feedback
            await websocket.send_text(f"TEXT: {transcript.text}")

            # 2. Synthesize (ElevenLabs)
            # Use 'flash' model for real-time speed
            audio_stream = generate(
                text=transcript.text,
                voice="Your_Cloned_Voice_ID",
                model="eleven_flash_v2_5",
                stream=True
            )
            
            # Stream audio bytes back to Frontend
            for chunk in audio_stream:
                if chunk:
                    await websocket.send_bytes(chunk)

    except Exception as e:
        print(f"Error: {e}")
    finally:
        await websocket.close()
        