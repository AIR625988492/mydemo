
from pdf2docx import Converter
def convert(name):
    print(name)
    pdf_file = 'C:\\OCR\\uploads\\result\\result.pdf'
    docx_file = 'C:\\OCR\\uploads\\result\\result.docx'

    # convert pdf to docx
    cv = Converter(pdf_file)
    # all pages by default
    cv.convert(docx_file)
    cv.close()
 
if __name__ == "__main__":
    convert("World")