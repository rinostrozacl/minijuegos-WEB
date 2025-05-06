import PyPDF2
import sys

def extract_text_from_pdf(pdf_path):
    """
    Extract text from a PDF file.
    
    Args:
        pdf_path (str): Path to the PDF file.
        
    Returns:
        str: Extracted text from the PDF.
    """
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            
            # Extract text from each page
            for page_num in range(len(reader.pages)):
                page = reader.pages[page_num]
                text += "\n--- Page {} ---\n".format(page_num + 1)
                text += page.extract_text()
                
            return text
    except Exception as e:
        return "Error extracting text: {}".format(str(e))

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python pdf_reader.py <pdf_path>")
        sys.exit(1)
        
    pdf_path = sys.argv[1]
    text = extract_text_from_pdf(pdf_path)
    print(text)
