/*
 * Office.js interactions for PowerPoint (Mac-stable)
 */

declare const PowerPoint: any;
declare const Office: any;

export interface SlideData {
  title: string;
  bullets: string[];
  notes: string;
  visualMetaphor?: string;
}

const THEME_PALETTES: Record<
  string,
  { title: string; body: string; bg: string }
> = {
  "Hero's Journey": { title: "#FFD700", body: "#EDF2F7", bg: "#1A202C" },
  "Pitch Deck": { title: "#10B981", body: "#1F2937", bg: "#FFFFFF" },
  "Problem-Solution": { title: "#6366F1", body: "#374151", bg: "#F8FAFC" },
  "Crimson Impact": { title: "#9f0e3d", body: "#2D3748", bg: "#FFFFFF" },
  "Burnt Orange": { title: "#b2470d", body: "#374151", bg: "#F8FAFC" },
  Standard: { title: "#2D3748", body: "#4A5568", bg: "#FFFFFF" },
};

/* -------------------------------------------------- */
/* Helpers                                            */
/* -------------------------------------------------- */

const safeText = (value?: string) => value?.trim() || " ";

/* -------------------------------------------------- */
/* Read slide text                                    */
/* -------------------------------------------------- */

/* -------------------------------------------------- */
/* Read slide text (Robust 3-Step Load)               */
/* -------------------------------------------------- */

/**
 * ULTRA-ROBUST text extraction for PowerPoint (Mac-Optimized)
 * Explicitly iterates through Tables, Groups, and TextFrames.
 * Formats tables as proper Markdown grids.
 */
async function extractTextFromShapes(shapes: any, context: any): Promise<string> {
  let combinedText = "";
  
  // 1. Load Universal Properties
  shapes.load("items/type, items/id");
  await context.sync();

  const textShapes: any[] = [];
  const tableShapes: any[] = [];
  const groupShapes: any[] = [];
  
  for (const s of shapes.items) {
    const t = s.type;
    if (t === "Table" || t === 19) tableShapes.push(s);
    else if (t === "Group" || t === 6) groupShapes.push(s);
    else if (t !== "Picture" && t !== 2 && t !== "Image") textShapes.push(s);
  }

  // 3. Selective Property Loading
  for (const s of textShapes) {
    s.load("textFrame/hasText, textFrame/textRange/text, textFrame/textRange/paragraphs/items/bullet/visible, textFrame/textRange/paragraphs/items/text");
  }
  for (const t of tableShapes) {
    t.load("table/rows"); 
  }
  await context.sync();

  // Load Table Cells
  if (tableShapes.length > 0) {
    for (const t of tableShapes) {
      try {
        if (t.table && t.table.rows) {
          t.table.rows.load("items/cells/items/textFrame/textRange/text");
        }
      } catch (e) {}
    }
    await context.sync();
  }

  // 4. Content Extraction
  // Standard Text
  for (const s of textShapes) {
    try {
      if (s.textFrame?.hasText) {
        if (s.textFrame.textRange.paragraphs && s.textFrame.textRange.paragraphs.items.length > 0) {
          for (const p of s.textFrame.textRange.paragraphs.items) {
            const prefix = (p.bullet && p.bullet.visible && !p.text.trim().startsWith("•")) ? "• " : "";
            combinedText += prefix + p.text + "\n";
          }
        } else {
          combinedText += s.textFrame.textRange.text + "\n";
        }
      }
    } catch (e) {
      try { combinedText += s.textFrame.textRange.text + "\n"; } catch (e2) {}
    }
  }
  
  // Table Data (Markdown Forge)
  for (const t of tableShapes) {
    try {
      if (t.table && t.table.rows && t.table.rows.items.length > 0) {
        combinedText += "\n### [TABLE STRUCTURE]\n";
        t.table.rows.items.forEach((row: any, rowIndex: number) => {
          const cells = row.cells.items.map((c: any) => c.textFrame?.textRange?.text?.replace(/\n/g, " ") || "");
          combinedText += "| " + cells.join(" | ") + " |\n";
          
          // Add Markdown header separator after the first row
          if (rowIndex === 0) {
            combinedText += "| " + cells.map(() => "---").join(" | ") + " |\n";
          }
        });
        combinedText += "\n";
      }
    } catch (e) {
      console.warn("Table extraction failed:", e);
    }
  }

  // Grouped Shapes (Recursive)
  for (const g of groupShapes) {
    try {
      if (g.shapes) {
        const groupText = await extractTextFromShapes(g.shapes, context);
        if (groupText) combinedText += "\n[Grouped Content]:\n" + groupText + "\n";
      }
    } catch (e) {}
  }

  return combinedText.trim();
}

export const getSlideText = async (): Promise<string> => {
  try {
    const result = await PowerPoint.run(async (context: any) => {
      const slides = context.presentation.getSelectedSlides();
      slides.load("items");
      await context.sync();

      if (!slides.items.length) return "ERR_NO_SLIDE_SELECTED";

      const slide = slides.items[0];
      return await extractTextFromShapes(slide.shapes, context);
    });

    // CRITICAL FALLBACK (Common API - Table & Matrix aware)
    if (!result || result.trim().length === 0) {
      console.log("[lib/office] Primary scan empty, trying Structured Table Fallback...");
      
      return new Promise((resolve) => {
        // First try to grab as a TABLE (Matrix)
        Office.context.document.getSelectedDataAsync(
          Office.CoercionType.Table, 
          (tableResult: any) => {
            if (tableResult.status === Office.AsyncResultStatus.Succeeded && tableResult.value) {
              const table = tableResult.value;
              let md = "\n### [STRUCTURED TABLE FALLBACK]\n";
              if (table.headers && table.headers.length > 0) {
                md += "| " + table.headers[0].join(" | ") + " |\n";
                md += "| " + table.headers[0].map(() => "---").join(" | ") + " |\n";
              }
              if (table.rows) {
                table.rows.forEach((row: any) => {
                  md += "| " + row.join(" | ") + " |\n";
                });
              }
              resolve(md);
            } else {
              // Final try: Just get whatever text is there
              Office.context.document.getSelectedDataAsync(
                Office.CoercionType.Text, 
                (textResult: any) => {
                  resolve(textResult.status === Office.AsyncResultStatus.Succeeded ? textResult.value : "");
                }
              );
            }
          }
        );
      });
    }

    return result;
  } catch (error) {
    console.error("Error in getSlideText:", error);
    return "";
  }
};

/* -------------------------------------------------- */
/* Insert single slide                                 */
/* -------------------------------------------------- */

export const insertSlide = async (
  suggestionText: string,
  title: string = "Suggestion"
) => {
  try {
    await PowerPoint.run(async (context: any) => {
      const slide = context.presentation.slides.add();

      const titleBox = slide.shapes.addTextBox(safeText(title));
      titleBox.left = 50;
      titleBox.top = 20;
      titleBox.width = 600;
      titleBox.height = 60;
      titleBox.textFrame.textRange.font.size = 24;
      titleBox.textFrame.textRange.font.bold = true;

      const bodyBox = slide.shapes.addTextBox(safeText(suggestionText));
      bodyBox.left = 50;
      bodyBox.top = 100;
      bodyBox.width = 600;
      bodyBox.height = 300;

      await context.sync();
    });
  } catch (error) {
    console.error("Error inserting slide:", error);
  }
};

/* -------------------------------------------------- */
/* Delete slide                                        */
/* -------------------------------------------------- */

export const deleteSlide = async (index: number) => {
  try {
    await PowerPoint.run(async (context: any) => {
      const slides = context.presentation.slides;
      slides.load("items");
      await context.sync();

      if (index >= 0 && index < slides.items.length) {
        slides.items[index].delete();
        await context.sync();
      }
    });
  } catch (error) {
    console.error("Error deleting slide:", error);
  }
};

/* -------------------------------------------------- */
/* Insert image                                        */
/* -------------------------------------------------- */

export const insertImage = async (base64Data: string) => {
  return new Promise<void>((resolve, reject) => {
    try {
      // Strip header if present
      const base64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, "");

      Office.context.document.setSelectedDataAsync(
        base64,
        {
          coercionType: Office.CoercionType.Image,
        },
        (asyncResult: any) => {
          if (asyncResult.status === Office.AsyncResultStatus.Failed) {
            console.error("[lib/office] Insert image failed:", asyncResult.error.message);
            reject(asyncResult.error.message);
          } else {
            console.log("[lib/office] Image inserted successfully via Common API");
            resolve();
          }
        }
      );
    } catch (error) {
      console.error("[lib/office] Error in insertImage:", error);
      reject(error);
    }
  });
};

/* -------------------------------------------------- */
/* Insert full deck (Mac-stable - SIMPLIFIED)         */
/* -------------------------------------------------- */

export const insertDeck = async (
  slidesData: SlideData[],
  structureType: string = "Standard"
) => {
  if (!slidesData?.length) return;

  const theme = THEME_PALETTES[structureType] || THEME_PALETTES.Standard;

  await PowerPoint.run(async (context: any) => {
    let createdSlides = 0;

    for (const data of slidesData) {
      // Skip empty slides
      if (!data.title?.trim() && !data.bullets?.length && !data.notes?.trim()) {
        console.warn("[office] Skipping empty slide");
        continue;
      }

      /* 1️⃣ Add slide and get it from collection */
      context.presentation.slides.add(PowerPoint.SlideLayout.blank);
      await context.sync();

      // Get the slides collection
      const slides = context.presentation.slides;
      slides.load("items");
      await context.sync();

      // Get the last slide (the one we just added)
      const slideIndex = slides.items.length - 1;
      const slide = slides.items[slideIndex];

      /* 2️⃣ Add background */
      try {
        const bgShape = slide.shapes.addShape(PowerPoint.ShapeType.rectangle);
        bgShape.left = 0;
        bgShape.top = 0;
        bgShape.width = 960;
        bgShape.height = 540;

        bgShape.fill.setSolidColor(theme.bg);
        bgShape.line.visible = false;

        await context.sync();

        bgShape.sendToBack();
        await context.sync();
      } catch (e) {
        console.warn("[office] Background failed:", e);
      }

      /* 3️⃣ Add TITLE */
      if (data.title?.trim()) {
        try {
          const titleBox = slide.shapes.addTextBox(data.title);
          titleBox.left = 50;
          titleBox.top = 50;
          titleBox.width = 860;
          titleBox.height = 80;

          titleBox.textFrame.textRange.font.size = 36;
          titleBox.textFrame.textRange.font.bold = true;
          titleBox.textFrame.textRange.font.color = theme.title;
          titleBox.textFrame.textRange.font.name = "Arial";

          await context.sync();
        } catch (e) {
          console.error("[office] Title failed:", e);
        }
      }

      /* 4️⃣ Add BODY */
      if (data.bullets?.length) {
        try {
          const bodyBox = slide.shapes.addTextBox(data.bullets.join("\n\n"));
          bodyBox.left = 50;
          bodyBox.top = 160;
          bodyBox.width = 860;
          bodyBox.height = 360;

          bodyBox.textFrame.textRange.font.size = 18;
          bodyBox.textFrame.textRange.font.color = theme.body;
          bodyBox.textFrame.textRange.font.name = "Arial";

          await context.sync();
        } catch (e) {
          console.error("[office] Body failed:", e);
        }
      }

      /* 5️⃣ Add NOTES */
      if (data.notes?.trim()) {
        try {
          const notesBox = slide.shapes.addTextBox(
            `📖 Speaker Notes:\n${data.notes}`
          );
          notesBox.left = 50;
          notesBox.top = 540;
          notesBox.width = 860;
          notesBox.height = 80;

          notesBox.textFrame.textRange.font.size = 10;
          notesBox.textFrame.textRange.font.color = "#555555";

          await context.sync();
        } catch (e) {
          console.error("[office] Notes failed:", e);
        }
      }

      createdSlides++;
      console.log(
        `[office] Created slide ${createdSlides}/${slidesData.length}`
      );
    }

    console.log(`[office] Successfully created ${createdSlides} slides`);
  });
};

/* -------------------------------------------------- */
/* Append Speaker Notes                               */
/* -------------------------------------------------- */

export const appendSpeakerNotes = async (text: string) => {
  try {
    await PowerPoint.run(async (context: any) => {
      const slides = context.presentation.getSelectedSlides();
      slides.load("items");
      await context.sync();

      if (!slides.items.length) return;
      const slide = slides.items[0];

      // Try to access standard notes page
      // Note: In some Office versions, direct notes access is limited.
      // We will try to add it as a new shape on the slide if we can't find a better way,
      // OR we can try to find a shape named "Notes" if we created it.
      
      // For this MVP, let's add a clearly marked "Research Notes" box at the bottom
      // to ensure it's visible to the user immediately.
      const noteShape = slide.shapes.addTextBox(text);
      noteShape.left = 50;
      noteShape.top = 450; // Bottom area
      noteShape.width = 860;
      noteShape.height = 80;
      noteShape.fill.setSolidColor("#FEF3C7"); // Light yellow for "Notes" feel
      noteShape.textFrame.textRange.font.color = "#4B5563";
      noteShape.textFrame.textRange.font.size = 11;

      await context.sync();
    });
  } catch (error) {
    console.error("[lib/office] Error appending notes:", error);
  }
};

/* -------------------------------------------------- */
/* Smart Export: Get Full Presentation Data           */
/* -------------------------------------------------- */

export const getPresentationData = async () => {
  try {
    return await PowerPoint.run(async (context: any) => {
      const slides = context.presentation.slides;
      slides.load("items");
      await context.sync();

      const slidesData = [];

      for (let i = 0; i < slides.items.length; i++) {
        const slide = slides.items[i];
        console.log(`[lib/office] Processing slide ${i + 1}/${slides.items.length}...`);
        
        const slideBody = await extractTextFromShapes(slide.shapes, context);

        slidesData.push({
          index: i + 1,
          content: slideBody || "(No text found)"
        });
      }
      
      return slidesData;
    });
  } catch (error) {
    console.error("Error in getPresentationData:", error);
    return [];
  }
};
