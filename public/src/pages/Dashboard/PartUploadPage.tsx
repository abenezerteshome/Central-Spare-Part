import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PartForm from '../../components/parts/PartForm';
import { FiUploadCloud, FiTrash2, FiImage, FiCamera } from 'react-icons/fi';
import { useToast } from '../../hooks/useToast';
import { useAgent } from '../../context/AgentContext';



const cardBase = 'bg-white rounded-lg shadow p-4';

type Preview = { file: File; url: string };

const PartUploadPage: React.FC = () => {
  const toast = useToast();
  const agentCtx = useAgent();

  // selected agent (can be controlled by context)
  const [selectedAgent, setSelectedAgent] = useState<string | null>(agentCtx.selectedAgent ?? null);

  // files and previews
  const [files, setFiles] = useState<File[] | null>(null);
  const previews = useMemo<Preview[]>(() => (files || []).map((f) => ({ file: f, url: URL.createObjectURL(f) })), [files]);

  // cleanup object URLs
  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  // Keep local selectedAgent in sync with context
  useEffect(() => {
    if (agentCtx.selectedAgent && agentCtx.selectedAgent !== selectedAgent) {
      setSelectedAgent(agentCtx.selectedAgent);
    }
  }, [agentCtx.selectedAgent]);

  // Drag & Drop / Browse helpers
  const handleDropFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    const arr = Array.from(incoming).filter((f) => f.type.startsWith('image/'));
    setFiles((prev) => (prev ? prev.concat(arr) : arr));
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => {
      if (!prev) return prev;
      const next = prev.slice();
      next.splice(index, 1);
      return next.length ? next : null;
    });
  }, []);

  // Camera / Webcam logic
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');

  const startStream = useCallback(async (facing?: 'environment' | 'user') => {
    const useFacing = facing ?? cameraFacing;
    try {
      // stop previous
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: useFacing }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      return stream;
    } catch (err: any) {
      console.error('camera error', err);
      toast.error(err?.name === 'NotAllowedError' ? 'Camera permission denied.' : 'Unable to access camera — use file input.');
      return null;
    }
  }, [cameraFacing]);

  const openCamera = useCallback(async () => {
    const stream = await startStream();
    if (stream) setShowCamera(true);
    else {
      // fallback to opening hidden file input
      const el = document.getElementById('mobileCameraInput') as HTMLInputElement | null;
      el?.click();
    }
  }, [startStream]);

  const closeCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setShowCamera(false);
  }, []);

  const switchCamera = useCallback(() => {
    const next = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(next);
    if (showCamera) startStream(next).then((s) => { if (!s) { const el = document.getElementById('mobileCameraInput') as HTMLInputElement | null; el?.click(); } });
  }, [cameraFacing, showCamera, startStream]);
const captureFromCamera = useCallback(() => {
  if (!videoRef.current) return;
  const video = videoRef.current;

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob((blob) => {
    if (!blob) return;

    const file = new File([blob], `webcam_${Date.now()}.jpg`, { type: 'image/jpeg' });

    setFiles((prev) => (prev ? [...prev, file] : [file]));

    // 🔥 STOP CAMERA immediately
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, "image/jpeg", 0.95);
}, []);

  // ensure stream is attached when modal opens
  useEffect(() => {
    if (showCamera && streamRef.current && videoRef.current) {
      try { videoRef.current.srcObject = streamRef.current; videoRef.current.play().catch(() => {}); } catch {};
    }
  }, [showCamera]);

  // cleanup on unmount
  useEffect(() => () => { if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop()); }, []);

  // UI helpers
  const fileCount = files ? files.length : 0;

  return (
    <DashboardLayout>
      <div className="p-4 max-w-3xl mx-auto">
        <h1 className="text-xl font-semibold mb-4">Upload Parts</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Agent + Actions */}
          <div className={cardBase + ' flex flex-col gap-4'}>
            
            

            <div>
              <label className="block text-sm text-gray-600 mb-1">Images</label>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleDropFiles(e.dataTransfer.files); }}
                className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center touch-manipulation"
                style={{ minHeight: 160 }}
              >
                <input id="mobileCameraInput" type="file" accept="image/*" capture={cameraFacing} className="sr-only" onChange={(e) => handleDropFiles(e.target.files)} />

                <div className="flex flex-col items-center justify-center">
                  <FiUploadCloud className="text-4xl text-gray-400 mb-2" />
                  <div className="text-base text-gray-700">Drop images here or choose</div>
                  <div className="text-sm text-gray-400">PNG / JPG — optimized for mobile</div>

                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <button type="button" onClick={openCamera} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border text-sm text-gray-700 hover:bg-gray-50">
                      <FiCamera /> Use Camera
                    </button>

                    <div className="relative inline-block">
                      <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border text-sm text-gray-700 hover:bg-gray-50">Browse Files</button>
                      <input type="file" accept="image/*" multiple style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} onChange={(e) => handleDropFiles(e.target.files)} />
                    </div>
                  </div>

                  <div className="mt-3 inline-flex items-center bg-gray-100 text-sm px-3 py-1 rounded-full text-gray-600">
                    <FiImage className="mr-2" /> {fileCount ? `${fileCount} selected` : 'No images'}
                  </div>
                </div>

                {/* Thumbnails (horizontal scroll on small screens) */}
                <div className="mt-4">
                  <div className="flex gap-3 overflow-x-auto py-2">
                    {previews.length === 0 ? (
                      <div className="flex-none w-full text-center text-sm text-gray-400 py-6"><FiImage className="mx-auto mb-2 text-2xl" /> No images selected</div>
                    ) : (
                      previews.map((p, i) => (
                        <div key={i} className="relative flex-none w-28 h-20 rounded overflow-hidden bg-gray-50">
                          <img src={p.url} alt={`preview-${i}`} className="w-full h-full object-cover" />
                          <button onClick={() => removeFile(i)} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow">
                            <FiTrash2 className="text-red-500" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Upload form (PartForm in upload mode) */}
          <div className={cardBase}>
            <PartForm
              mode="upload"
              controlledAgentId={selectedAgent || undefined}
              onAgentChange={(id) => { setSelectedAgent(id); agentCtx.setSelectedAgent(id); }}
              controlledImages={files}
              onImagesChange={(f) => setFiles(f)}
              keepAgentAfterSubmit
              hideFileInput
              formId="part-upload-form"
              onSuccess={() => toast.success('Uploaded successfully')}
            />
          </div>
        </div>

        {/* Camera Modal */}
     {/* CAMERA — FULLSCREEN MODAL */}
{showCamera && (
  <div className="fixed inset-0 z-50 bg-black flex flex-col">
    
    {/* Top bar */}
    <div className="flex items-center justify-between px-4 py-3 bg-black/40 text-white">
      <button
        onClick={switchCamera}
        className="px-3 py-1 bg-white/20 rounded text-sm"
      >
        {cameraFacing === 'environment' ? 'Front' : 'Back'}
      </button>

      <button
        onClick={closeCamera}
        className="px-2 py-1 text-white text-lg"
      >
        ✕
      </button>
    </div>

    {/* Video FULL SCREEN */}
    <div className="flex-1 flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        muted
      />
    </div>

    {/* Capture button */}
    <div className="flex justify-center py-5 bg-black/40">
      <button
        onClick={() => {
          captureFromCamera();  
          closeCamera();         // 🔥 auto close after capture
        }}
        className="w-20 h-20 rounded-full bg-white border-4 border-gray-300"
      ></button>
    </div>
  </div>
)}


       
      </div>
    </DashboardLayout>
  );
};

export default PartUploadPage;
