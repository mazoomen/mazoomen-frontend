"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { X, Share2, Download, Copy, Check, Smartphone, MessageCircle } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  inviteUrl: string;
  slug: string;
}

export async function generateQrCodeFile(
  url: string,
  filename = "invitation-qr.png",
  logoUrl = "/favicon.ico"
): Promise<{ dataUrl: string; blob: Blob; file: File }> {
  const size = 600;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  // Render QR code with High ('H') error correction level
  await QRCode.toCanvas(canvas, url, {
    width: size,
    margin: 2,
    errorCorrectionLevel: "H",
    color: {
      dark: "#0B1528",  // Mazoom signature navy
      light: "#FFFFFF", // Crisp white background
    },
  });

  const ctx = canvas.getContext("2d");
  if (ctx) {
    const center = size / 2;
    const badgeRadius = Math.floor(size * 0.125); // ~75px radius
    const logoRadius = Math.floor(size * 0.095);   // ~57px radius

    ctx.save();

    // Outer gold border ring (#E5C38B)
    ctx.beginPath();
    ctx.arc(center, center, badgeRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#E5C38B";
    ctx.stroke();

    // Inner subtle navy ring (#0B1528)
    ctx.beginPath();
    ctx.arc(center, center, badgeRadius - 4, 0, Math.PI * 2);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#0B1528";
    ctx.stroke();

    // Draw centered logo image
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";

      const loaded = await new Promise<boolean>((resolve) => {
        logoImg.onload = () => resolve(true);
        logoImg.onerror = () => resolve(false);
        logoImg.src = logoUrl;
      });

      if (loaded && logoImg.naturalWidth > 0) {
        ctx.beginPath();
        ctx.arc(center, center, logoRadius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(
          logoImg,
          center - logoRadius,
          center - logoRadius,
          logoRadius * 2,
          logoRadius * 2
        );
      } else {
        // Fallback Mazoom Monogram
        ctx.fillStyle = "#0B1528";
        ctx.font = "bold 56px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("M", center, center);
      }
    } catch {
      ctx.fillStyle = "#0B1528";
      ctx.font = "bold 56px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("M", center, center);
    }

    ctx.restore();
  }

  const dataUrl = canvas.toDataURL("image/png");
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const file = new File([blob], filename, { type: "image/png" });

  return { dataUrl, blob, file };
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  inviteUrl,
  slug,
}) => {
  const { t } = useLanguage();
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSharing, setIsSharing] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && inviteUrl) {
      generateQrCodeFile(inviteUrl, `qr-${slug || "invitation"}.png`)
        .then(({ dataUrl, file }) => {
          setQrDataUrl(dataUrl);
          setQrFile(file);
        })
        .catch((err) => {
          console.error("Failed to generate QR Code", err);
        });
    }
  }, [isOpen, inviteUrl, slug]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `invitation-qr-${slug || "invite"}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShareOnPhone = async () => {
    if (typeof window !== "undefined" && !navigator.share) {
      alert(t("Web Share API is not supported on this browser."));
      return;
    }
    setIsSharing(true);

    const shareData: ShareData = {
      title: title,
      text: `${title}\n${inviteUrl}`,
      url: inviteUrl,
    };

    if (qrFile && navigator.canShare && navigator.canShare({ files: [qrFile] })) {
      shareData.files = [qrFile];
    }

    try {
      await navigator.share(shareData);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Share failed", err);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`${title}\n${inviteUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E5C38B]/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0B1528] text-[#E5C38B] flex items-center justify-center shadow-xs">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0B1528]">{t("Share Invitation")}</h3>
              <p className="text-xs text-neutral-500 line-clamp-1">{title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/50 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Branded QR Code Container */}
          <div className="flex flex-col items-center justify-center p-5 bg-[#FAF8F5] rounded-2xl border border-[#E5C38B]/40 shadow-xs relative overflow-hidden">
            {qrDataUrl ? (
              <div className="p-3 bg-white rounded-2xl shadow-md border border-[#E5C38B]/30 mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt="Invitation QR Code"
                  className="w-48 h-48 object-contain rounded-xl"
                />
              </div>
            ) : (
              <div className="w-48 h-48 flex items-center justify-center bg-white rounded-2xl border border-neutral-200 mb-3">
                <div className="w-8 h-8 border-2 border-[#0B1528] border-t-[#E5C38B] rounded-full animate-spin" />
              </div>
            )}
            <p className="text-xs font-semibold text-[#0B1528] text-center flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E5C38B]" />
              {t("Scan QR Code to view invitation")}
            </p>
          </div>

          {/* Invitation URL Copy Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-500">
              {t("Copy Link")}
            </label>
            <div className="flex items-center gap-2 p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl">
              <span className="text-xs text-neutral-600 truncate flex-1 font-mono select-all dir-ltr">
                {inviteUrl}
              </span>
              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  copied
                    ? "bg-emerald-600 text-white"
                    : "bg-[#0B1528] text-white hover:bg-black"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{t("Copied!")}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t("Copy Link")}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Grid */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {/* Phone Share Button */}
            <button
              onClick={handleShareOnPhone}
              disabled={isSharing}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#0B1528] text-white hover:bg-black font-medium text-xs transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-[#E5C38B]" />
              <span>{t("Share on Phone")}</span>
            </button>

            {/* WhatsApp Share Button */}
            <button
              onClick={handleWhatsAppShare}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-all shadow-xs cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t("WhatsApp")}</span>
            </button>

            {/* Download QR Code */}
            <button
              onClick={handleDownloadQr}
              disabled={!qrDataUrl}
              className="col-span-2 w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 font-medium text-xs transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4 text-neutral-600" />
              <span>{t("Download QR Code")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
