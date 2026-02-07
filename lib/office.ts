/*
 * Office.js interactions for PowerPoint
 */

declare const PowerPoint: any;
declare const Office: any;

export const getSlideText = async (): Promise<string> => {
  try {
    return await PowerPoint.run(async (context: any) => {
      // Get the current selected slide
      const slides = context.presentation.getSelectedSlides();
      slides.load("items");
      await context.sync();

      if (slides.items.length === 0) return "";

      const currentSlide = slides.items[0];
      const shapes = currentSlide.shapes;
      shapes.load("items");
      await context.sync();

      let slideText = "";
      
      // Load properties for all shapes
      // We can't iterate "items" before loading properties on them in some versions, 
      // but commonly we load the collection "items" property first.
      
      // We need to load textFrame for each shape
      // context.sync() is needed after loading the collection to iterate
      
      // To be efficient, we queue loads for all items then sync once
      for (let i = 0; i < shapes.items.length; i++) {
        shapes.items[i].load("textFrame/hasText, textFrame/textRange/text");
      }
      await context.sync();

      for (let i = 0; i < shapes.items.length; i++) {
        const shape = shapes.items[i];
        // Check if textFrame exists (it might not on some shapes)
        // Accessing properties that weren't loaded or don't exist is safe if we checked structure,
        // but TypeScript might complain about possible undefined.
        if (shape.textFrame && shape.textFrame.hasText) {
          slideText += shape.textFrame.textRange.text + " ";
        }
      }

      return slideText.trim();
    });
  } catch (error) {
    console.error("Error getting slide text:", error);
    return "";
  }
};

export const insertSlide = async (suggestionText: string, title: string = "Suggestion") => {
  try {
    await PowerPoint.run(async (context: any) => {
      const slides = context.presentation.slides;
      // Add a new slide to the end
      const newSlide = slides.add();
      
      // We can't easily add a textbox with specific coordinates in all API versions straightforwardly 
      // without first loading the slide or using a layout.
      // But let's try mostly standard approach.
      // Note: addTextBox might not be available on all slide objects in older APIs.
      // If it fails, we might need to use a layout.
      
      // Standard way is often to use the Master or Layout.
      // For simplicity in this specialized task, we'll try to add a generic slide 
      // and maybe put text in the title/body placeholders if possible, or add shape.
      
      newSlide.load("shapes");
      await context.sync();
      
      // Add Title
      const titleBox = newSlide.shapes.addTextBox(title, {
        left: 50,
        top: 20,
        width: 600,
        height: 60
      });
      titleBox.textFrame.textRange.font.size = 24;
      titleBox.textFrame.textRange.font.bold = true;

      // Add Suggestion Body
      const textBox = newSlide.shapes.addTextBox(suggestionText, {
        left: 50,
        top: 100, // Moved down to make room for title
        width: 600,
        height: 300
      });
      
      await context.sync();
    });
  } catch (error) {
    console.error("Error inserting slide:", error);
  }
};
