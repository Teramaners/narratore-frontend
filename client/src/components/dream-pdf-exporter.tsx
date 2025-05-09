import { DreamCollection } from "@/types";
import jsPDF from "jspdf";

export async function exportDreamCollectionToPdf(collection: DreamCollection) {
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(18);
  doc.text(collection.title || "Collezione di Sogni", 105, y, { align: "center" });
  y += 10;

  doc.setFontSize(12);
  if (collection.description) {
    const descriptionLines = doc.splitTextToSize(collection.description, 180);
    doc.text(descriptionLines, 15, y);
    y += descriptionLines.length * 7;
  }

  for (let i = 0; i < collection.dreams.length; i++) {
    const dream = collection.dreams[i];

    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 128);
    doc.text(`Sogno #${i + 1}`, 15, y);
    y += 8;

    if (dream.image) {
      try {
        const imageData = await convertImageUrlToBase64(dream.image);
        doc.addImage(imageData, "JPEG", 15, y, 40, 40);
        y += 45;
      } catch (error) {
        console.error("Errore nell'aggiunta immagine:", error);
      }
    }

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    if (dream.text) {
      const dreamText = doc.splitTextToSize(`Testo: ${dream.text}`, 180);
      doc.text(dreamText, 15, y);
      y += dreamText.length * 7;
    }

    if (dream.story) {
      const storyText = doc.splitTextToSize(`Storia: ${dream.story}`, 180);
      doc.text(storyText, 15, y);
      y += storyText.length * 7;
    }

    if (dream.translation) {
      const emojiText = doc.splitTextToSize(`Traduzione Emoji: ${dream.translation}`, 180);
      doc.text(emojiText, 15, y);
      y += emojiText.length * 7;
    }

    y += 10;
  }

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      `${collection.title || "Collezione di Sogni"} - Pagina ${i} di ${totalPages}`,
      105,
      290,
      { align: "center" }
    );
  }

  doc.save(`${collection.title || "collezione-sogni"}.pdf`);
}

async function convertImageUrlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject("Impossibile convertire l'immagine");
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
