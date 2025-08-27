import React, { useEffect, useRef, useState } from "react";

export default function CameraView() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const streamRef = useRef(null); // Store camera stream reference

  const [baseURL, setBaseURL] = useState("http://localhost:11434");
  const [model, setModel] = useState("smolvlm");
  const [instruction, setInstruction] = useState("What do you see?");
  const [responseText, setResponseText] = useState("Initializing camera...");
  const [intervalMs, setIntervalMs] = useState(1000);
  const [isRunning, setIsRunning] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream; // Store stream reference
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
          setResponseText("Camera access granted. Ready to start.");
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setResponseText(`Error accessing camera: ${err.name} - ${err.message}. Ensure permissions are granted and you are on HTTPS or localhost.`);
      }
    }
    initCamera();
    return () => {
      // Cleanup on component unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (intervalRef.current) { 
        clearInterval(intervalRef.current); 
        intervalRef.current = null; 
      }
    };
  }, []);

  function captureImage() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) return null;
    const targetWidth = 640;
    const scale = targetWidth / video.videoWidth;
    const w = Math.max(1, Math.floor(video.videoWidth * scale));
    const h = Math.max(1, Math.floor(video.videoHeight * scale));
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.8);
  }

  // Function to start camera
  async function startCamera() {
    if (streamRef.current) return; // Already active
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setResponseText("Camera restarted. Ready to start processing.");
      }
    } catch (err) {
      console.error("Error starting camera:", err);
      setResponseText(`Error starting camera: ${err.message}`);
    }
  }

  // Function to stop camera
  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setResponseText("Camera stopped.");
  }

  async function sendChatCompletionRequest(instructionText, imageBase64URL) {
    const url = `${baseURL.replace(/\/$/, "")}/v1/chat/completions`;
    const body = {
      model,
      max_tokens: 200,
      messages: [
        { role: "user", content: [
          { type: "text", text: instructionText },
          { type: "image_url", image_url: { url: imageBase64URL } }
        ]}
      ]
    };
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) { throw new Error(`Server error ${res.status}: ${await res.text()}`); }
    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? "(no content)";
  }

  async function tick() {
    if (isSending) return;
    setIsSending(true);
    try {
      const img = captureImage();
      if (!img) { setResponseText("Failed to capture image. Stream might not be active."); return; }
      const reply = await sendChatCompletionRequest(instruction, img);
      setResponseText(reply);
    } catch (e) {
      console.error(e);
      setResponseText(`Error: ${e.message}`);
    } finally { setIsSending(false); }
  }

  function handleStart() {
    if (isRunning) return;
    if (!cameraActive) {
      startCamera(); // Restart camera if stopped
    }
    setIsRunning(true);
    setResponseText("Processing started...");
    tick();
    intervalRef.current = setInterval(tick, intervalMs);
  }

  function handleStop() {
    setIsRunning(false);
    if (intervalRef.current) { 
      clearInterval(intervalRef.current); 
      intervalRef.current = null; 
    }
    
    setResponseText("Processing stopped. Camera still active.");
  }

  function handleStopAndCloseCamera() {
    setIsRunning(false);
    if (intervalRef.current) { 
      clearInterval(intervalRef.current); 
      intervalRef.current = null; 
    }
    
    // Stop the camera stream to free up the camera
    stopCamera();
    
    setResponseText("Processing and camera stopped.");
  }

  const styles = {
    page: { fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: 20, backgroundColor: "#f0f0f0", minHeight: "100vh" },
    card: { background: "#fff", padding: 15, borderRadius: 8, boxShadow: "0 2px 5px rgba(0,0,0,0.1)" },
    controls: { display: "flex", gap: 10, alignItems: "center" },
    ioAreas: { display: "flex", gap: 10, alignItems: "stretch", flexDirection: "column", width: 800, maxWidth: "95vw" },
    textarea: { width: 600, height: 80, padding: 8, border: "1px solid #ccc", borderRadius: 4, fontSize: 14 },
    input: { width: 400, padding: 8, border: "1px solid #ccc", borderRadius: 4, fontSize: 14 },
    select: { padding: 8, borderRadius: 4, border: "1px solid #ccc" },
    video: { width: 480, height: 360, border: "2px solid #333", borderRadius: 8, backgroundColor: "#000" },
    button: (variant) => ({ padding: "10px 20px", fontSize: 16, cursor: "pointer", border: "none", borderRadius: 4, color: "white", backgroundColor: variant === "start" ? "#28a745" : "#dc3545" }),
    label: { fontWeight: "bold" },
    row: { display: "flex", gap: 10, alignItems: "center" },
  };

  return (
    <div style={styles.page}>
      <h1>Local LLM Camera App Using Local Ollama</h1>
      
      <div style={styles.card}>
        <video ref={videoRef} autoPlay playsInline style={styles.video} />
        <div style={{ marginTop: 10, textAlign: "center" }}>
          <span style={{ 
            color: cameraActive ? "#28a745" : "#dc3545", 
            fontWeight: "bold",
            marginRight: 15
          }}>
            Camera: {cameraActive ? "Active" : "Inactive"}
          </span>
          {!cameraActive && !isRunning && (
            <button 
              style={{ ...styles.button("start"), fontSize: 14, padding: "5px 10px" }} 
              onClick={startCamera}
            >
              Restart Camera
            </button>
          )}
        </div>
      </div>
      
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div style={{ ...styles.card, ...styles.ioAreas }}>
        <div style={styles.row}><label htmlFor="baseUrl" style={styles.label}>Base API:</label></div>
        <input id="baseUrl" value={baseURL} onChange={(e) => setBaseURL(e.target.value)} style={styles.input} placeholder="http://localhost:11434" />

        <div style={styles.row}><label htmlFor="model" style={styles.label}>Model:</label></div>
        <select id="model" value={model} onChange={(e) => setModel(e.target.value)} style={styles.select}>
          <option value="smolvlm">smolvlm (GGUF)</option>
          <option value="llava:13b">llava:13b</option>
          <option value="moondream">moondream</option>
          <option value="llava-phi">llava-phi</option>
        </select>

        <div style={styles.row}><label htmlFor="instruction" style={styles.label}>Instruction:</label></div>
        <textarea id="instruction" style={{ ...styles.textarea, height: 40 }} value={instruction} onChange={(e) => setInstruction(e.target.value)} />

        <div style={styles.row}><label htmlFor="response" style={styles.label}>Response:</label></div>
        <textarea id="response" style={{ ...styles.textarea, height: 60 }} value={responseText} readOnly placeholder="Server response will appear here..." />
      </div>

      <div style={{ ...styles.card, ...styles.controls }}>
        <label htmlFor="interval" style={styles.label}>Interval between requests:</label>
        <select id="interval" value={intervalMs} onChange={(e) => setIntervalMs(parseInt(e.target.value, 10))} style={styles.select} disabled={isRunning}>
          <option value={250}>250 ms</option>
          <option value={500}>500 ms</option>
          <option value={1000}>1 s</option>
          <option value={2000}>2 s</option>
        </select>
        {isRunning ? (
          <div style={{ display: "flex", gap: 10 }}>
            <button style={styles.button("stop")} onClick={handleStop}>Pause</button>
            <button 
              style={{ ...styles.button("stop"), backgroundColor: "#6c757d" }} 
              onClick={handleStopAndCloseCamera}
            >
              Stop & Close Camera
            </button>
          </div>
        ) : (
          <button style={styles.button("start")} onClick={handleStart}>Start</button>
        )}
      </div>

      <p style={{ maxWidth: 800, textAlign: "center", color: "#555" }}>
        For SmolVLM GGUF: Create model with Ollama using downloaded GGUF file. For traditional models: Pull a vision model (e.g., <code>ollama pull llava:13b</code>). Keep the Base API as <code>{baseURL}</code>.
        <br /><br />
        <strong>Camera Controls:</strong> "Pause" stops processing but keeps camera active. "Stop & Close Camera" releases the camera completely. You can restart the camera anytime when not processing.
      </p>
    </div>
  );
}
