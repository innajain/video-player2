import { useEffect, useRef, useState } from "react";
import ControlsPanel from "./ControlsPanel";
function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hiddenVideoRef = useRef<HTMLVideoElement>(null);
  const [frameDataUrl, setFrameDataUrl] = useState<string>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [savedPauseState, setSavedPauseState] = useState(false);
  const pressTimer = useRef<NodeJS.Timeout>();
  const timerCompleted = useRef(false);
  const [videoFile, setVideoFile] = useState<string>();
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    function handleSpaceHold() {
      timerCompleted.current = true;
      if (!isPlaying) {
        videoRef.current?.play();
        setIsPlaying(true);
        setSavedPauseState(true);
      }
      videoRef.current?.playbackRate
        ? (videoRef.current.playbackRate = 2)
        : null;
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (videoRef.current) {
        if (e.key === "ArrowRight") {
          videoRef.current.currentTime = videoRef.current.currentTime + 5;
          setCurrentTime(videoRef.current.currentTime);
        } else if (e.key === "ArrowLeft") {
          videoRef.current.currentTime = videoRef.current.currentTime - 5;
          setCurrentTime(videoRef.current.currentTime);
        } else if (e.key === " ") {
          if (!pressTimer.current) {
            pressTimer.current = setTimeout(handleSpaceHold, 500);
          }
        } else if (e.key === "f") {
          if (videoRef.current.requestFullscreen) {
            if (isFullScreen) {
              document.exitFullscreen();
              setIsFullScreen(false);
            } else {
              videoRef.current.requestFullscreen();
              setIsFullScreen(true);
            }
          }
        } else if ("0123456789".includes(e.key)) {
          const num = Number(e.key);
          videoRef.current.currentTime =
            (videoRef.current.duration! / 10) * num;
          setCurrentTime(videoRef.current.currentTime);
        } else if (e.key == "+") {
          if (videoRef.current.playbackRate < 3) {
            videoRef.current.playbackRate += 0.25;
            setPlaybackRate(videoRef.current.playbackRate);
          }
        } else if (e.key == "-") {
          if (videoRef.current.playbackRate > 0.25) {
            videoRef.current.playbackRate -= 0.25;
            setPlaybackRate(videoRef.current.playbackRate);
          }
        }
      }
    }
    function handleKeyUp(e: KeyboardEvent) {
      if (e.key === " ") {
        clearTimeout(pressTimer.current!);
        pressTimer.current = undefined;
        if (videoRef.current && timerCompleted.current == true) {
          videoRef.current.playbackRate = 1;
          setPlaybackRate(1);
        }
        if (timerCompleted.current == false) {
          if (isPlaying) {
            setIsPlaying(false);
            videoRef.current?.pause();
          } else {
            setIsPlaying(true);
            videoRef.current?.play();
          }
        }
        if (savedPauseState) {
          setIsPlaying(false);
          videoRef.current?.pause();
          setSavedPauseState(false);
        }
        timerCompleted.current = false;
      }
    }
    addEventListener("keydown", handleKeyDown);
    addEventListener("keyup", handleKeyUp);
    return () => {
      removeEventListener("keydown", handleKeyDown);
      removeEventListener("keyup", handleKeyUp);
    };
  }, [isPlaying, isFullScreen]);
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    let file = e.dataTransfer.files[0];
    if (file.name.toLowerCase().endsWith(".mkv")) {
      const newName = file.name.replace(/\.mkv$/, ".mp4");
      file = new File([file], newName, { type: file.type });
    }
    const fileURL = URL.createObjectURL(file);
    setVideoFile(fileURL);
  };
  return (
    <div
      className="w-full h-[100vh] flex justify-center items-center bg-black relative"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div
        className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 
        flex justify-center items-center"
      >
        <p className="text-white text-2xl">Drop the mp4 video here</p>
      </div>
      {videoFile && (
        <p className="absolute text-3xl text-white font-extrabold top-0 right-0 p-3">
          {playbackRate}
        </p>
      )}
      {videoFile && (
        <div className="h-full p-5 relative flex flex-col justify-between items-center">
          <video
            src={videoFile}
            className="h-[95%] relative"
            ref={videoRef}
            autoPlay
            playsInline
            controls={false}
            onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime!)}
            onClick={() => {
              if (isPlaying) {
                setIsPlaying(false);
                videoRef.current?.pause();
              } else {
                setIsPlaying(true);
                videoRef.current?.play();
              }
            }}
          ></video>
          <video
            src={videoFile}
            style={{ display: "none" }}
            ref={hiddenVideoRef}
          ></video>

          <ControlsPanel
            isPlaying={isPlaying}
            videoRef={videoRef}
            setIsPlaying={setIsPlaying}
            currentTime={currentTime}
            setCurrentTime={setCurrentTime}
            hiddenVideoRef={hiddenVideoRef}
            setPreviewTime={setPreviewTime}
            setFrameDataUrl={setFrameDataUrl}
            frameDataUrl={frameDataUrl}
            previewTime={previewTime}
          />
        </div>
      )}
    </div>
  );
}

export default App;
