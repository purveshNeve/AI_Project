import pymupdf


class PDFParsingError(ValueError):
    """Raised when an uploaded file cannot be read as a PDF."""


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    if not pdf_bytes:
        raise PDFParsingError("The uploaded PDF is empty.")

    try:
        with pymupdf.open(stream=pdf_bytes, filetype="pdf") as document:
            if document.needs_pass:
                raise PDFParsingError("Password-protected PDFs are not supported.")
            return "\n".join(
                page.get_text("text", sort=True)
                for page in document
            ).strip()
    except pymupdf.FileDataError as error:
        raise PDFParsingError("The uploaded file is not a readable PDF.") from error