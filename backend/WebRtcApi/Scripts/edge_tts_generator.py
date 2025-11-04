import asyncio
import edge_tts
import sys
import os

async def generate_audio(text, output_path, voice="en-US-JennyNeural"):
    """Generate audio from text using Edge TTS"""
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_path)
    print(f"Audio saved to: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python edge_tts_generator.py <text> <output_path> [voice]")
        sys.exit(1)
    
    text = sys.argv[1]
    output_path = sys.argv[2]
    voice = sys.argv[3] if len(sys.argv) > 3 else "en-US-JennyNeural"
    
    # Create directory if not exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Generate audio
    asyncio.run(generate_audio(text, output_path, voice))
