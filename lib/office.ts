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

interface StructuredContent {
  text: string;
  tables: string[][][];
}

/**
 * ULTRA-ROBUST text extraction for PowerPoint (Mac-Optimized)
 * Explicitly iterates through Tables, Groups, and TextFrames.
 * Uses Allow-List logic to prevent InvalidArgument errors on unsupported shapes.
 */
async function extractStructuredContentFromShapes(shapes: any, context: any): Promise<StructuredContent> {
  let combinedText = "";
  const tables: string[][][] = [];
  
  // STAGE 1: Identify Shape Types
  shapes.load("items/type, items/id, items/name, items/title");
  await context.sync();

  // STAGE 2: Load Interface Proxies (Safe allow-list)
  for (const s of shapes.items) {
    const t = s.type;
    console.log(`[lib/office] Inspecting shape: ${s.name} (Type: ${t})`);
    
    // Explicit Allow-List Logic
    if (t === "Table" || t === 19) {
      s.load("table");
    } 
    else if (t === "Group" || t === 6) {
      s.load("shapes");
    } 
    else if (
      t === "AutoShape" || t === 1 || 
      t === "TextBox" || t === 17 || 
      t === "Placeholder" || t === 14 ||
      t === "Callout" || t === 2
    ) {
      // Known text-supporting shapes
      s.load("textFrame");
    } 
    else if (
        t === "Image" || t === "Picture" || t === 13 || 
        t === "Media" || t === 7 ||
        t === "GraphicFrame" || t === 10 || // SmartArt often lives here
        t === "Line" || t === 9
    ) {
      // UNSUPPORTED for textFrame - Skip to avoid Mac crash
      // Just load metadata for context
      s.load("name");
      if (t === "Image" || t === "Picture" || t === 13) {
          s.load("altTextDescription");
      }
    } 
    else {
      // Unknown type? Safer to skip textFrame than crash
      console.warn(`[lib/office] Unknown shape type ${t}, skipping textFrame load.`);
      s.load("name");
    }
  }
  await context.sync();

  // STAGE 3: Load Data Depth (Safe properties only)
  for (const s of shapes.items) {
    const t = s.type;
    try {
      if (s.table) {
        // Tables: load rows first to check structure
        s.table.load("rows/items/cells/items/textFrame/textRange/text");
      } 
      else if (s.shapes) {
        // Groups: recursive prep handled in stage 4
      } 
      else if (s.textFrame) {
        // Text: load text content
        s.textFrame.load("hasText, textRange/text");
      }
    } catch (e) {
        console.warn(`[lib/office] Stage 3 load failed for shape ${s.name}`, e);
    }
  }
  await context.sync();

  // STAGE 4: Data Extraction
  for (const s of shapes.items) {
    const t = s.type;
    
    // 4a. Tables
    if (s.table && s.table.rows) {
      try {
        const tableData: string[][] = [];
        s.table.rows.items.forEach((row: any) => {
          const cells = row.cells.items.map((c: any) => c.textFrame?.textRange?.text?.replace(/\n/g, " ") || "");
          tableData.push(cells);
        });
        
        if (tableData.length > 0) {
          tables.push(tableData);
          combinedText += "\n### [TABLE]\n";
          tableData.forEach((row, rowIndex) => {
            combinedText += "| " + row.join(" | ") + " |\n";
            if (rowIndex === 0) {
              combinedText += "| " + row.map(() => "---").join(" | ") + " |\n";
            }
          });
          combinedText += "\n";
        }
      } catch (e) {
        console.warn("[office] Table extraction failed for shape " + s.id, e);
      }
    }

    // 4b. SmartArt / Graphics (Context Only)
    else if (t === "GraphicFrame" || t === 10) {
        combinedText += `\n[SMARTART/GRAPHIC: ${s.name || "Complex Graphic"}]\n(Visual data requires manual review)\n`;
    }

    // 4c. Images (Context)
    else if (t === "Image" || t === "Picture" || t === 13) {
      const desc = s.altTextDescription || s.name || "Unlabeled Image";
      combinedText += `\n[IMAGE: ${desc}]\n`;
    }
    
    // 4d. Text
    else if (s.textFrame && s.textFrame.hasText) {
      try {
        combinedText += s.textFrame.textRange.text + "\n";
      } catch (e) {}
    }

    // 4e. Groups (Recursive)
    else if (s.shapes) {
      try {
        const groupContent = await extractStructuredContentFromShapes(s.shapes, context);
        if (groupContent.text) combinedText += "\n[Grouped Content]:\n" + groupContent.text + "\n";
        tables.push(...groupContent.tables);
      } catch (e) {}
    }
  }

  return {
    text: combinedText.trim(),
    tables: tables
  };
}

// Legacy wrapper
async function extractTextFromShapes(shapes: any, context: any): Promise<string> {
  const content = await extractStructuredContentFromShapes(shapes, context);
  return content.text;
}

export const getSlideText = async (): Promise<string> => {
  try {
    const result = await PowerPoint.run(async (context: any) => {
      const slides = context.presentation.getSelectedSlides();
      slides.load("items");
      await context.sync();

      if (!slides.items.length) return "ERR_NO_SLIDE_SELECTED";

      const slide = slides.items[0];
      // Try robust structured extraction first
      try {
        const content = await extractStructuredContentFromShapes(slide.shapes, context);
        if (content.text && content.text.trim().length > 0) {
            return content.text;
        }
      } catch (innerError) {
        console.warn("[lib/office] Structured extraction failed, falling back...", innerError);
      }
      return ""; // Trigger fallback
    });

    // CRITICAL FALLBACK (Common API - Table & Matrix aware)
    if (!result || result.trim().length === 0) {
      console.log("[lib/office] Primary scan empty/failed, trying Structured Table Fallback...");
      
      return new Promise((resolve) => {
        // First try to grab as a TABLE (Matrix) - often works for selection
        Office.context.document.getSelectedDataAsync(
          Office.CoercionType.Table, 
          (tableResult: any) => {
            if (tableResult.status === Office.AsyncResultStatus.Succeeded && tableResult.value) {
              const table = tableResult.value;
              let md = "\n### [STRUCTURED TABLE DATA]\n"; // Specific marker for AI
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
              // Final try: Just get whatever text is selected or on slide
              Office.context.document.getSelectedDataAsync(
                Office.CoercionType.Text, 
                (textResult: any) => {
                   if (textResult.status === Office.AsyncResultStatus.Succeeded && textResult.value) {
                       resolve(textResult.value);
                   } else {
                       // Absolute last resort: "No Text Found"
                       resolve("");
                   }
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
/* Get Presentation Info (Name/URL)                   */
/* -------------------------------------------------- */

export const getPresentationInfo = () => {
  return new Promise<{ name: string; url: string }>((resolve) => {
    try {
      if (typeof Office === "undefined" || !Office.context) {
        resolve({ name: "Untitled Presentation", url: "" });
        return;
      }
      Office.context.document.getFilePropertiesAsync((result: any) => {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
          const url = result.value.url || "";
          // Extract filename from URL or default
          const name = url ? url.substring(url.lastIndexOf('/') + 1) : "Untitled Presentation";
          resolve({ name, url });
        } else {
          resolve({ name: "Untitled Presentation", url: "" });
        }
      });
    } catch (error) {
       console.warn("Error getting file info", error);
       resolve({ name: "My Presentation", url: "" });
    }
  });
};

export const getCurrentSlideId = async (): Promise<string> => {
  try {
    return await PowerPoint.run(async (context: any) => {
      const slides = context.presentation.getSelectedSlides();
      slides.load("items/id");
      await context.sync();

      if (slides.items.length > 0) {
        return slides.items[0].id;
      }
      return "";
    });
  } catch (e) {
    console.warn("Could not get slide ID", e);
    return "";
  }
};

export const getCurrentSlideIndex = async (): Promise<number> => {
  try {
    return await PowerPoint.run(async (context: any) => {
      // We need to find the index.
      // Easiest is to load all slides and find the selected one by ID, 
      // or just trust the selection order if the API supports it directly.
      // But a reliable way is:
      const slides = context.presentation.slides;
      slides.load("items/id");
      const selection = context.presentation.getSelectedSlides();
      selection.load("items/id");
      await context.sync();
      
      if (selection.items.length === 0) return 1;

      const selectedId = selection.items[0].id;
      const index = slides.items.findIndex((s: any) => s.id === selectedId);
      return index >= 0 ? index + 1 : 1;
    });
  } catch (e) {
    console.warn("Could not get slide Index", e);
    return 1;
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
/* Smart Export: Get Full Presentation Data (Structured) */
/* -------------------------------------------------- */

export const getPresentationStructuredData = async () => {
  try {
    return await PowerPoint.run(async (context: any) => {
      const slides = context.presentation.slides;
      slides.load("items");
      await context.sync();

      const slidesData = [];

      for (let i = 0; i < slides.items.length; i++) {
        const slide = slides.items[i];
        console.log(`[lib/office] Processing slide ${i + 1}/${slides.items.length} (Structured)...`);
        
        const content = await extractStructuredContentFromShapes(slide.shapes, context);

        slidesData.push({
          index: i + 1,
          text: content.text || "(No text found)",
          tables: content.tables
        });
      }
      
      return slidesData;
    });
  } catch (error) {
    console.error("Error in getPresentationStructuredData:", error);
    return [];
  }
};
