"use client";

import {
  CalendarDays,
  Clock,
  Flower2,
  MapPin,
  Play,
  Sparkles,
  Volume2,
  VolumeX,
  CalendarPlus,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const INVITE = {
  title: "IT'S MY BIRTHDAY!",
  subtitle: "SAVE THE DATE",
  dateLabel: "4 de Julio",
  timeLabel: "19 hs",
  location: "Jorge Matte Gormaz 1400 depto 402",
  googleFormUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLSfSjcwKSyu-LW-o_3JP8HVf4CeuI8jkDt23suW06IxDP5m80A/viewform?embedded=true",
  eventDateIso: "2026-07-04T19:00:00-04:00",
  musicUrl: "/music/flor-song.mp3",
  videoUrl:
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260611_183632_c311af08-e4b7-458f-81e7-79847a49b3d3.mp4",
};

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function BoomerangVideoBg({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const framesRef = useRef<ImageBitmap[]>([]);
  const [isCanvasMode, setIsCanvasMode] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let cancelled = false;
    let frameRequest = 0;
    let animationRequest = 0;
    const captureCanvas = document.createElement("canvas");
    const captureContext = captureCanvas.getContext("2d", { alpha: false });

    const sizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const captureFrame = async () => {
      if (!captureContext || video.readyState < 2 || cancelled) return;
      const width = Math.min(960, video.videoWidth || 960);
      const height = Math.round(width * ((video.videoHeight || 540) / (video.videoWidth || 960)));
      captureCanvas.width = width;
      captureCanvas.height = height;
      captureContext.drawImage(video, 0, 0, width, height);
      try {
        framesRef.current.push(await createImageBitmap(captureCanvas));
      } catch {
        // Some browsers block bitmap creation on cross-origin frames; the video remains visible.
      }
    };

    const scheduleCapture = () => {
      if (cancelled || video.ended) return;
      if ("requestVideoFrameCallback" in HTMLVideoElement.prototype) {
        const callback = () => {
          void captureFrame();
          scheduleCapture();
        };
        (video as HTMLVideoElement & {
          requestVideoFrameCallback: (cb: () => void) => number;
        }).requestVideoFrameCallback(callback);
      } else {
        frameRequest = window.requestAnimationFrame(() => {
          void captureFrame();
          scheduleCapture();
        });
      }
    };

    const drawCoverFrame = (bitmap: ImageBitmap) => {
      const context = canvas.getContext("2d");
      if (!context) return;
      const canvasRatio = canvas.width / canvas.height;
      const imageRatio = bitmap.width / bitmap.height;
      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let dx = 0;
      let dy = 0;

      if (imageRatio > canvasRatio) {
        drawWidth = canvas.height * imageRatio;
        dx = (canvas.width - drawWidth) / 2;
      } else {
        drawHeight = canvas.width / imageRatio;
        dy = (canvas.height - drawHeight) / 2;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, dx, dy, drawWidth, drawHeight);
    };

    const playBoomerang = () => {
      const frames = framesRef.current;
      if (!frames.length || cancelled) return;
      setIsCanvasMode(true);
      let index = 0;
      let direction = 1;
      let lastTime = 0;

      const tick = (time: number) => {
        if (cancelled) return;
        if (time - lastTime > 1000 / 30) {
          drawCoverFrame(frames[index]);
          index += direction;
          if (index >= frames.length - 1 || index <= 0) direction *= -1;
          lastTime = time;
        }
        animationRequest = window.requestAnimationFrame(tick);
      };

      animationRequest = window.requestAnimationFrame(tick);
    };

    sizeCanvas();
    window.addEventListener("resize", sizeCanvas);
    video.addEventListener("play", scheduleCapture, { once: true });
    video.addEventListener("ended", playBoomerang);
    void video.play().catch(() => undefined);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", sizeCanvas);
      window.cancelAnimationFrame(frameRequest);
      window.cancelAnimationFrame(animationRequest);
      framesRef.current.forEach((frame) => frame.close());
      framesRef.current = [];
    };
  }, [src]);

  return (
    <div className="absolute inset-0 z-0 origin-center scale-[1.08] overflow-hidden">
      <video
        ref={videoRef}
        className={`h-full w-full object-cover ${isCanvasMode ? "hidden" : "block"}`}
        src={src}
        muted
        playsInline
        crossOrigin="anonymous"
      />
      <canvas ref={canvasRef} className={isCanvasMode ? "block h-full w-full" : "hidden"} />
    </div>
  );
}

function useCountdown(targetIso: string): Countdown {
  const [countdown, setCountdown] = useState<Countdown>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const target = new Date(targetIso).getTime();
    const update = () => {
      const distance = Math.max(0, target - Date.now());
      setCountdown({
        days: Math.floor(distance / 86400000),
        hours: Math.floor((distance / 3600000) % 24),
        minutes: Math.floor((distance / 60000) % 60),
        seconds: Math.floor((distance / 1000) % 60),
      });
    };
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [targetIso]);

  return countdown;
}

function BlumiLogo() {
  return (
    <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald text-cream shadow-pop">
      <Flower2 aria-hidden className="h-5 w-5" />
    </span>
  );
}

function EntranceScreen({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-hidden bg-sky px-5 text-ink">
      <ToyClouds />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center text-center">
        <div className="mb-6 flex items-center gap-3 text-lg font-black uppercase tracking-wide">
          <BlumiLogo />
          Flor
        </div>
        <p className="font-display text-5xl font-black uppercase leading-[0.88] sm:text-7xl">
          estás invitado al cumple de flor
        </p>
        <button
          aria-label="Abrir invitacion"
          className="door-button group mt-10"
          onClick={onEnter}
          type="button"
        >
          <span className="door-panel">
            <span className="door-glow" />
            <span className="door-knob" />
            <span className="door-label">Abrir</span>
          </span>
        </button>
      </div>
    </div>
  );
}

function ToyClouds() {
  const clouds = [
    "left-[4%] top-[10%] w-28 sm:w-40",
    "right-[7%] top-[16%] w-24 sm:w-36 [animation-delay:1.4s]",
    "left-[18%] top-[32%] w-20 sm:w-32 [animation-delay:2.8s]",
    "right-[18%] bottom-[20%] w-28 sm:w-44 [animation-delay:4.2s]",
    "left-[8%] bottom-[14%] w-24 sm:w-36 [animation-delay:5.6s]",
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {clouds.map((cloud) => (
        <div aria-hidden className={`toy-cloud absolute ${cloud}`} key={cloud}>
          <span />
        </div>
      ))}
    </div>
  );
}

function FloralAtmosphere() {
  const petals = useMemo(
    () =>
      Array.from({ length: 44 }, (_, index) => ({
        id: index,
        left: `${(index * 17) % 100}%`,
        width: 10 + (index % 5) * 4,
        duration: `${12 + (index % 8)}s`,
        delay: `${-(index * 0.7)}s`,
        xStart: `${-20 + (index % 7) * 7}px`,
        xEnd: `${20 - (index % 9) * 8}px`,
        spin: `${180 + (index % 6) * 120}deg`,
        opacity: 0.35 + (index % 5) * 0.1,
      })),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[2] overflow-hidden">
      <div className="glow-orchid absolute -left-24 top-28 h-72 w-72 rounded-full bg-pink/25 blur-3xl" />
      <div className="glow-orchid absolute -right-28 top-1/3 h-80 w-80 rounded-full bg-yellow/25 blur-3xl [animation-delay:1.8s]" />
      <div className="glow-orchid absolute bottom-8 left-1/4 h-60 w-60 rounded-full bg-blue/15 blur-3xl [animation-delay:3s]" />
      {petals.map((petal) => (
        <span
          key={petal.id}
          className="petal absolute top-0"
          style={
            {
              left: petal.left,
              width: petal.width,
              height: petal.width * 1.55,
              "--duration": petal.duration,
              "--delay": petal.delay,
              "--x-start": petal.xStart,
              "--x-end": petal.xEnd,
              "--spin": petal.spin,
              "--opacity": petal.opacity,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

function CountdownPanel() {
  const countdown = useCountdown(INVITE.eventDateIso);
  const units = [
    ["Dias", countdown.days],
    ["Horas", countdown.hours],
    ["Min", countdown.minutes],
    ["Seg", countdown.seconds],
  ];

  return (
    <div className="grid grid-cols-4 rounded-lg border-2 border-ink bg-cream text-ink shadow-hard">
      {units.map(([label, value], i) => (
        <div
          key={label}
          className={`px-1 py-3 text-center sm:px-3 ${i < units.length - 1 ? "border-r-2 border-ink" : ""}`}
        >
          <div className="text-xl font-black sm:text-3xl">{String(value).padStart(2, "0")}</div>
          <div className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-ink/60 sm:text-[10px] sm:tracking-[0.18em]">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 text-cream sm:gap-5">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-pink text-cream shadow-pop sm:h-14 sm:w-14">
        {icon}
      </div>
      <p className="text-base font-black uppercase leading-tight tracking-[0.08em] sm:text-lg">
        <span className="text-yellow">{label}:</span> {value}
      </p>
    </div>
  );
}

function MusicButton({
  isPlaying,
  onToggle,
}: {
  isPlaying: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      aria-label={isPlaying ? "Pausar musica" : "Reproducir musica"}
      className="fixed bottom-4 right-4 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-ink bg-cream text-ink shadow-hard transition hover:-translate-y-0.5 sm:bottom-6 sm:right-6"
      onClick={onToggle}
      type="button"
    >
      {isPlaying ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
    </button>
  );
}

function AddToCalendarButton() {
  const start = "20260704T190000";
  const end = "20260704T230000";
  const title = encodeURIComponent("Cumple de Flor 🎂");
  const location = encodeURIComponent(INVITE.location);
  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}-0400/${end}-0400&location=${location}`;

  return (
    <a
      href={googleUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-yellow px-5 py-2.5 text-sm font-black uppercase tracking-[0.1em] text-ink shadow-hard transition hover:-translate-y-0.5"
    >
      <CalendarPlus aria-hidden className="h-4 w-4" />
      Agregar al calendario
    </a>
  );
}

export default function Home() {
  const [hasEntered, setHasEntered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const enterInvitation = () => {
    setHasEntered(true);
    void playMusic();
  };

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      await playMusic();
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const scrollToRsvp = () => {
    document.getElementById("rsvp")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-emerald text-cream">
      <audio ref={audioRef} loop preload="auto" src={INVITE.musicUrl} />
      {!hasEntered ? <EntranceScreen onEnter={enterInvitation} /> : null}
      {hasEntered ? <MusicButton isPlaying={isPlaying} onToggle={toggleMusic} /> : null}

      <section className="hero-stage relative flex min-h-screen w-full items-center overflow-hidden px-4 py-10 sm:px-6">
        <BoomerangVideoBg src={INVITE.videoUrl} />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-white/10 via-transparent to-emerald/25" />
        <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_24%,rgba(255,255,255,0.14),transparent_34%)]" />
        <ToyClouds />
        <FloralAtmosphere />
      

        <header className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-4 py-5 sm:px-6 md:px-10">
          <div className="flex items-center gap-3 text-lg font-black uppercase tracking-wide text-ink">
            <BlumiLogo />
            Flor
          </div>
          <nav className="hidden items-center gap-8 text-sm font-black uppercase tracking-[0.16em] text-ink/80 md:flex">
            <a href="#details" className="transition-colors hover:text-ink">
              Detalles
            </a>
            <a href="#rsvp" className="transition-colors hover:text-ink">
              RSVP
            </a>
          </nav>
          <button
            onClick={scrollToRsvp}
            className="rounded-full border-2 border-ink bg-cream px-4 py-2 text-sm font-black text-ink shadow-sm transition hover:-translate-y-0.5"
          >
            Confirmar
          </button>
        </header>

        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center pt-28 text-center sm:pt-36 md:pt-44">
          <div className="animate-fade-up delay-1 mb-5 rounded-full bg-yellow px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-ink shadow-sm sm:mb-6 sm:text-sm">
            <Sparkles aria-hidden className="mr-1 inline h-4 w-4" />
            {INVITE.subtitle}
          </div>
          <h1 className="font-display animate-fade-up delay-2 max-w-5xl text-5xl font-black uppercase leading-[0.86] text-ink sm:text-7xl md:text-8xl lg:text-9xl">
            {INVITE.title}
          </h1>
          <p className="animate-fade-up delay-3 mt-5 max-w-md text-2xl font-black leading-tight text-white sm:mt-6 md:text-3xl">
            {INVITE.dateLabel} {INVITE.timeLabel}
          </p>
          <div className="animate-fade-up delay-4 mt-8 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <button
              onClick={scrollToRsvp}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-ink px-7 text-base font-black text-cream shadow-hard transition hover:-translate-y-0.5"
            >
              Confirmar asistencia
              <Play aria-hidden className="h-4 w-4" />
            </button>
            <a
              href="#details"
              className="inline-flex min-h-14 items-center justify-center rounded-full border-2 border-ink bg-cream px-7 text-base font-black text-ink shadow-sm transition hover:-translate-y-0.5"
            >
              Ver detalles
            </a>
          </div>
          <div className="animate-fade-up delay-5 mt-10 w-full max-w-xl">
            <CountdownPanel />
          </div>
        </div>
      </section>

      <section className="botanical-stage relative z-10 overflow-hidden px-4 py-14 sm:px-6 sm:py-16">
        <div className="botanical-drift" />
        <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-10">
          <div id="details" className="grid gap-5 rounded-3xl bg-emerald/45 p-6 backdrop-blur-sm sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-yellow">
              Event details
            </p>
            <div className="grid gap-5">
              <DetailItem icon={<CalendarDays size={20} />} label="Date" value={INVITE.dateLabel} />
              <DetailItem icon={<Clock size={20} />} label="Time" value={INVITE.timeLabel} />
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-pink text-cream shadow-pop sm:h-14 sm:w-14">
                  <MapPin size={20} />
                </div>
                <p className="text-base font-black uppercase leading-tight tracking-[0.08em] sm:text-lg">
                  <span className="text-yellow">Location:</span>{" "}
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(INVITE.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 transition hover:text-yellow"
                  >
                    {INVITE.location}
                  </a>
                </p>
              </div>
            </div>
            <div className="pt-1">
              <AddToCalendarButton />
            </div>
          </div>

          <div
            id="kino"
            className="mx-auto w-fit max-w-full rounded-full border-2 border-ink bg-yellow/95 px-5 py-3 text-center text-ink shadow-hard sm:px-7"
          >
            <h2 className="whitespace-normal text-sm font-black uppercase leading-tight tracking-[0.04em] sm:whitespace-nowrap sm:text-base">
              que estos 36 vengan con suerte, llamemosla juntos 🍀
            </h2>
          </div>

          <div id="rsvp" className="grid gap-6 rounded-3xl bg-cream/92 p-5 text-ink shadow-hard backdrop-blur-md sm:p-7 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-pink">RSVP</p>
              <h2 className="font-display mt-3 text-4xl font-black uppercase leading-none text-yellow sm:text-5xl">
                Confirmá asistencia
              </h2>
            </div>
            <div className="overflow-hidden rounded-2xl border-2 border-ink bg-white">
              {INVITE.googleFormUrl.startsWith("http") ? (
                <iframe
                  src={INVITE.googleFormUrl}
                  title="Flor birthday RSVP"
                  className="h-[500px] w-full bg-white sm:h-[540px]"
                />
              ) : (
                <div className="flex h-[500px] items-center justify-center p-8 text-center">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.24em] text-ink/60">
                      Google Form
                    </p>
                    <p className="mt-3 text-xl font-black">[ADD GOOGLE FORM IFRAME URL]</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pb-6 pt-2 text-center">
            <p className="script-message mx-auto max-w-full whitespace-normal text-2xl leading-snug text-cream sm:text-4xl md:text-6xl">
              Can&apos;t wait to celebrate with you ♥
            </p>
            <p className="script-message mt-4 text-2xl leading-snug text-pink sm:text-4xl md:text-6xl">Flor</p>
          </div>
        </div>
      </section>
    </main>
  );
}
