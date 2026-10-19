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

def extract_links_from_pdf(pdf_bytes: bytes) -> list[str]:
    """Extract clickable HTTP(S) links embedded in a PDF."""
    links: list[str] = []

    try:
        with pymupdf.open(stream=pdf_bytes, filetype="pdf") as document:
            for page in document:
                for link in page.get_links():
                    uri = link.get("uri")
                    if uri and uri.lower().startswith(("https://", "http://")):
                        if uri not in links:
                            links.append(uri)
    except pymupdf.FileDataError as error:
        raise PDFParsingError("The uploaded file is not a readable PDF.") from error

    return links


