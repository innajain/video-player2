import { useRef } from "react";
import { getTimeFormatted } from "./utils/utility functions";

export default function ControlsPanel({
  videoRef,
  currentTime,
  setCurrentTime,
  hiddenVideoRef,
  setPreviewTime,
  setFrameDataUrl,
  frameDataUrl,
  previewTime,
}: {
  isPlaying: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  hiddenVideoRef: React.RefObject<HTMLVideoElement>;
  setPreviewTime: React.Dispatch<React.SetStateAction<number>>;
  setFrameDataUrl: React.Dispatch<React.SetStateAction<string | undefined>>;
  frameDataUrl: string | undefined;
  previewTime: number;
}) {
  const hoverWaiter = useRef<NodeJS.Timeout>();
  return (
    <div className="w-full absolute bottom-0 translate-5y-full flex items-center p-2 gap-5 text-white">
      <p style={{ textWrap: "nowrap" }}>
        {getTimeFormatted(currentTime) +
          " / " +
          getTimeFormatted(Number(videoRef.current?.duration.toFixed(0)) || 0)}
      </p>
      <div className="w-full relative">
        <input
          value={currentTime}
          type="range"
          max={videoRef.current?.duration || 0}
          className="w-full"
          onChange={(e) => {
            if (videoRef.current) {
              videoRef.current.currentTime = Number(e.target.value);
              setCurrentTime(videoRef.current.currentTime);
            }
          }}
          onMouseMove={(e) => {
            if (hoverWaiter.current) {
              clearTimeout(hoverWaiter.current);
              hoverWaiter.current = undefined;
            }
            const rect = e.currentTarget.getBoundingClientRect();
            hoverWaiter.current = setTimeout(() => {
              if (!hiddenVideoRef.current) return;
              const offsetX = e.clientX - rect.left;
              const percentage = offsetX / rect.width;
              const newTime = percentage * hiddenVideoRef.current.duration!;
              setPreviewTime(newTime);
              hiddenVideoRef.current.currentTime = newTime;
              const canvas = document.createElement("canvas");
              canvas.width = hiddenVideoRef.current.videoWidth!;
              canvas.height = hiddenVideoRef.current.videoHeight!;
              const ctx = canvas.getContext("2d")!;
              ctx.drawImage(
                hiddenVideoRef.current,
                0,
                0,
                canvas.width,
                canvas.height
              );

              const dataUrl = canvas.toDataURL();
              setFrameDataUrl(dataUrl);
            }, 200);
          }}
          onMouseLeave={() => {
            setFrameDataUrl(undefined);
            if (hoverWaiter.current) {
              clearTimeout(hoverWaiter.current);
              hoverWaiter.current = undefined;
            }
          }}
        />

        {frameDataUrl && (
          <img
            className={`w-72 absolute top-0 -translate-y-full -translate-x-1/2`}
            style={{
              left: `${(previewTime / videoRef.current?.duration!) * 100}%`,
            }}
            src={frameDataUrl}
            alt="Captured Frame"
          />
        )}
      </div>
    </div>
  );
}
