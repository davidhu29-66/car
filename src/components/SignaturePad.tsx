/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface SignaturePadProps {
  value: string;           // base64 PNG or empty string
  onChange: (value: string) => void;
  label?: string;
  height?: number;
}

export default function SignaturePad({ value, onChange, label, height = 120 }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [isEmpty, setIsEmpty] = useState(!value);

  // Draw saved signature onto canvas when value changes externally
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (value && value.startsWith('data:image')) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setIsEmpty(false);
      };
      img.src = value;
    } else if (!value) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setIsEmpty(true);
    }
  }, [value]);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    isDrawing.current = true;
    lastPos.current = getPos(e);

    const ctx = canvas.getContext('2d')!;
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
  }, []);

  const draw = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e);

    ctx.lineWidth = e.pointerType === 'pen' ? Math.max(1, e.pressure * 3) : 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e293b';

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);

    lastPos.current = pos;
    setIsEmpty(false);
  }, []);

  const endDraw = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    isDrawing.current = false;
    lastPos.current = null;
    if (isEmpty) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // JPEG doesn't support transparency — flatten onto white first
    const flat = document.createElement('canvas');
    flat.width = canvas.width;
    flat.height = canvas.height;
    const fctx = flat.getContext('2d')!;
    fctx.fillStyle = '#ffffff';
    fctx.fillRect(0, 0, flat.width, flat.height);
    fctx.drawImage(canvas, 0, 0);
    onChange(flat.toDataURL('image/jpeg', 0.4));
  }, [onChange]);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onChange('');
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-[10px] font-extrabold text-slate-500 block uppercase mb-1">
          {label}
        </label>
      )}
      <div className="relative border border-slate-300 rounded-lg bg-white overflow-hidden"
           style={{ height }}>
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-slate-300 text-xs select-none">Sign here</span>
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={400}
          height={height}
          className="w-full h-full touch-none cursor-crosshair"
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={endDraw}
          onPointerLeave={endDraw}
        />
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={clear}
          className="text-[10px] text-slate-400 hover:text-red-500 transition-colors font-semibold uppercase tracking-wider"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
