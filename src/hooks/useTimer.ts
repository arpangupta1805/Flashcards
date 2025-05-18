import { useState, useEffect, useCallback, useRef } from 'react';

interface TimerOptions {
  initialTime?: number; // Initial time in seconds
  autoStart?: boolean; // Whether to start the timer automatically
  onComplete?: () => void; // Callback when timer completes
}

interface TimerState {
  time: number; // Current time in seconds
  isRunning: boolean;
  isComplete: boolean;
  progress: number; // Progress from 0 to 1
}

interface TimerControls {
  start: () => void;
  pause: () => void;
  reset: () => void;
  restart: () => void;
  setTime: (seconds: number) => void;
}

type TimerHookResult = [TimerState, TimerControls];

/**
 * Custom hook for a timer with start, pause, reset functionality
 * @param options Timer configuration options
 * @returns [state, controls] tuple
 */
export function useTimer(options: TimerOptions = {}): TimerHookResult {
  const {
    initialTime = 25 * 60, // Default: 25 minutes (Pomodoro)
    autoStart = false,
    onComplete
  } = options;

  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isComplete, setIsComplete] = useState(false);
  
  const initialTimeRef = useRef(initialTime);
  const intervalRef = useRef<number | null>(null);
  
  // Calculate progress (0 to 1)
  const progress = Math.max(0, Math.min(1, time / initialTimeRef.current));

  // Timer controls
  const start = useCallback(() => {
    if (isComplete) return;
    setIsRunning(true);
  }, [isComplete]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    pause();
    setTime(initialTimeRef.current);
    setIsComplete(false);
  }, [pause]);

  const restart = useCallback(() => {
    reset();
    start();
  }, [reset, start]);

  const setTimerDuration = useCallback((seconds: number) => {
    initialTimeRef.current = seconds;
    setTime(seconds);
    setIsComplete(false);
  }, []);

  // Timer effect
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setTime((prevTime) => {
        if (prevTime <= 1) {
          // Timer complete
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setIsRunning(false);
          setIsComplete(true);
          onComplete?.();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, onComplete]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const state: TimerState = {
    time,
    isRunning,
    isComplete,
    progress
  };

  const controls: TimerControls = {
    start,
    pause,
    reset,
    restart,
    setTime: setTimerDuration
  };

  return [state, controls];
}

/**
 * Format seconds into a time string (MM:SS)
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
} 