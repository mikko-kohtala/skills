# python-docx Library Tutorial

Generate .docx files with Python.

**Important: Read this entire document before starting.** Critical patterns and common pitfalls are covered throughout.

## Setup

Install python-docx library:
```bash
pip install python-docx
```

Basic usage:
```python
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

doc = Document()
doc.add_heading('My Document', level=0)
doc.add_paragraph('Content here')
doc.save('output.docx')
```

## Headings & Paragraphs

```python
# Headings (levels 0-9, where 0 is Title)
doc.add_heading('Document Title', level=0)
doc.add_heading('Section Heading', level=1)
doc.add_heading('Subsection', level=2)

# Paragraphs
p = doc.add_paragraph('Regular paragraph text')

# Paragraph with formatting
p = doc.add_paragraph()
run = p.add_run('Bold text')
run.bold = True
run.font.size = Pt(14)
run.font.color.rgb = RGBColor(0, 0, 255)  # Blue

# Alignment
p.alignment = WD_ALIGN_PARAGRAPH.CENTER  # or LEFT, RIGHT, JUSTIFY

# Paragraph spacing (in points)
from docx.shared import Pt
p.paragraph_format.space_before = Pt(12)
p.paragraph_format.space_after = Pt(12)
```

## Text Formatting

```python
# Create run with multiple formats
run = p.add_run('Formatted text')
run.bold = True
run.italic = True
run.underline = True
run.font.size = Pt(14)
run.font.name = 'Arial'
run.font.color.rgb = RGBColor(255, 0, 0)  # Red

# Superscript and subscript
run.font.superscript = True  # For x²
run.font.subscript = True    # For H₂O

# Small caps
run.font.small_caps = True

# Strike through
run.font.strike = True

# Highlight
from docx.enum.text import WD_COLOR_INDEX
run.font.highlight_color = WD_COLOR_INDEX.YELLOW
```

## Lists

```python
# Bullet list
doc.add_paragraph('First bullet', style='List Bullet')
doc.add_paragraph('Second bullet', style='List Bullet')
doc.add_paragraph('Third bullet', style='List Bullet')

# Numbered list
doc.add_paragraph('First item', style='List Number')
doc.add_paragraph('Second item', style='List Number')
doc.add_paragraph('Third item', style='List Number')

# Multi-level lists
doc.add_paragraph('Main item', style='List Bullet')
doc.add_paragraph('Sub-item', style='List Bullet 2')
doc.add_paragraph('Sub-sub-item', style='List Bullet 3')

# IMPORTANT: Each add_paragraph with list style continues the list
# To start a new list, add a non-list paragraph in between
doc.add_paragraph('First list item', style='List Number')
doc.add_paragraph()  # Break the list
doc.add_paragraph('New list (restarts at 1)', style='List Number')
```

## Tables

```python
# Create table (3 rows x 3 columns)
table = doc.add_table(rows=3, cols=3)
table.style = 'Light Grid Accent 1'  # Apply built-in style

# Access cells
cell = table.rows[0].cells[0]
cell.text = 'Header 1'

# Add content to cells
for row in table.rows:
    for cell in row.cells:
        cell.text = 'Content'

# Add rows dynamically
row = table.add_row()
row.cells[0].text = 'New row'

# Cell formatting
cell.paragraphs[0].runs[0].bold = True
cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER

# Table borders and shading
from docx.oxml.shared import OxmlElement, qn

def set_cell_border(cell, **kwargs):
    """Set cell borders
    Usage: set_cell_border(cell, top={"sz": 12, "color": "#FF0000"})
    """
    tc = cell._element
    tcPr = tc.get_or_add_tcPr()
    tcBorders = OxmlElement('w:tcBorders')

    for edge in ('start', 'top', 'end', 'bottom', 'insideH', 'insideV'):
        if edge in kwargs:
            element = OxmlElement(f'w:{edge}')
            for key in ['sz', 'val', 'color']:
                if key in kwargs[edge]:
                    element.set(qn(f'w:{key}'), str(kwargs[edge][key]))
            tcBorders.append(element)

    tcPr.append(tcBorders)

# Cell shading
from docx.oxml.ns import nsdecls
from docx.oxml import parse_xml

def set_cell_shading(cell, fill_color):
    """Set cell background color
    Usage: set_cell_shading(cell, "D9E2F3")
    """
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_color}"/>')
    cell._element.get_or_add_tcPr().append(shading_elm)
```

## Images

```python
from docx.shared import Inches

# Add image with size
doc.add_picture('image.png', width=Inches(2.0))

# Add image in specific location (in paragraph)
p = doc.add_paragraph()
run = p.add_run()
run.add_picture('logo.png', height=Inches(1.0))

# IMPORTANT: Maintain aspect ratio
# Only specify width OR height, not both (unless you want to distort)
doc.add_picture('photo.jpg', width=Inches(4.0))  # Height auto-calculated
```

## Styles

```python
# Built-in paragraph styles
doc.add_paragraph('Text', style='Heading 1')
doc.add_paragraph('Text', style='Heading 2')
doc.add_paragraph('Text', style='Body Text')
doc.add_paragraph('Text', style='Quote')
doc.add_paragraph('Text', style='Intense Quote')
doc.add_paragraph('Text', style='List Bullet')
doc.add_paragraph('Text', style='List Number')

# Custom styles (create once, reuse)
from docx.shared import RGBColor
from docx.enum.style import WD_STYLE_TYPE

styles = doc.styles
style = styles.add_style('CustomHeading', WD_STYLE_TYPE.PARAGRAPH)
style.font.name = 'Arial'
style.font.size = Pt(16)
style.font.bold = True
style.font.color.rgb = RGBColor(0, 0, 139)  # Dark blue
style.paragraph_format.space_before = Pt(12)
style.paragraph_format.space_after = Pt(6)

# Use custom style
doc.add_paragraph('Custom styled text', style='CustomHeading')
```

## Headers & Footers

```python
# Access header/footer
section = doc.sections[0]
header = section.header
footer = section.footer

# Add content to header
header_para = header.paragraphs[0]
header_para.text = 'Document Header'
header_para.alignment = WD_ALIGN_PARAGRAPH.CENTER

# Add content to footer
footer_para = footer.paragraphs[0]
footer_para.text = 'Page '
run = footer_para.add_run()

# Add page numbers (requires accessing XML)
from docx.oxml import OxmlElement

def add_page_number(paragraph):
    """Add page number field to paragraph"""
    run = paragraph.add_run()
    fldChar1 = OxmlElement('w:fldChar')
    fldChar1.set(qn('w:fldCharType'), 'begin')
    instrText = OxmlElement('w:instrText')
    instrText.set(qn('xml:space'), 'preserve')
    instrText.text = 'PAGE'
    fldChar2 = OxmlElement('w:fldChar')
    fldChar2.set(qn('w:fldCharType'), 'end')

    run._element.append(fldChar1)
    run._element.append(instrText)
    run._element.append(fldChar2)

add_page_number(footer_para)
```

## Page Setup

```python
from docx.shared import Inches
from docx.enum.section import WD_ORIENT

# Access section (each section can have different settings)
section = doc.sections[0]

# Page margins
section.top_margin = Inches(1)
section.bottom_margin = Inches(1)
section.left_margin = Inches(1)
section.right_margin = Inches(1)

# Page orientation
section.orientation = WD_ORIENT.PORTRAIT  # or LANDSCAPE

# Page size (for landscape, swap width and height)
section.page_width = Inches(8.5)
section.page_height = Inches(11)

# Page breaks
doc.add_page_break()
```

## Hyperlinks

```python
# External hyperlinks (requires XML manipulation)
from docx.oxml.shared import OxmlElement, qn

def add_hyperlink(paragraph, text, url):
    """Add hyperlink to paragraph"""
    part = paragraph.part
    r_id = part.relate_to(url, 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink', is_external=True)

    hyperlink = OxmlElement('w:hyperlink')
    hyperlink.set(qn('r:id'), r_id)

    new_run = OxmlElement('w:r')
    rPr = OxmlElement('w:rPr')

    # Hyperlink style (blue + underline)
    u = OxmlElement('w:u')
    u.set(qn('w:val'), 'single')
    rPr.append(u)

    color = OxmlElement('w:color')
    color.set(qn('w:val'), '0000FF')
    rPr.append(color)

    new_run.append(rPr)

    t = OxmlElement('w:t')
    t.text = text
    new_run.append(t)

    hyperlink.append(new_run)
    paragraph._p.append(hyperlink)

# Usage
p = doc.add_paragraph('Visit ')
add_hyperlink(p, 'Google', 'https://www.google.com')
p.add_run(' for more info')
```

## Tabs & Indentation

```python
from docx.shared import Inches

p = doc.add_paragraph()

# Indentation
p.paragraph_format.left_indent = Inches(0.5)
p.paragraph_format.right_indent = Inches(0.5)
p.paragraph_format.first_line_indent = Inches(0.5)  # Indent first line

# Hanging indent (for lists)
p.paragraph_format.left_indent = Inches(0.5)
p.paragraph_format.first_line_indent = Inches(-0.5)

# Tabs
from docx.enum.text import WD_TAB_ALIGNMENT, WD_TAB_LEADER

tab_stops = p.paragraph_format.tab_stops
tab_stops.add_tab_stop(Inches(2.0), WD_TAB_ALIGNMENT.LEFT)
tab_stops.add_tab_stop(Inches(4.0), WD_TAB_ALIGNMENT.CENTER)
tab_stops.add_tab_stop(Inches(6.0), WD_TAB_ALIGNMENT.RIGHT, WD_TAB_LEADER.DOTS)

p.add_run('Left\tCenter\tRight')
```

## Common Pitfalls

1. **Modifying runs after creation**: Create all formatting when you create the run, not afterwards
   ```python
   # WRONG - text won't be bold
   p = doc.add_paragraph('Bold text')
   p.runs[0].bold = True

   # CORRECT - format the run immediately
   p = doc.add_paragraph()
   run = p.add_run('Bold text')
   run.bold = True
   ```

2. **List continuation**: Lists continue automatically
   ```python
   # Creates continuous list (1, 2, 3)
   doc.add_paragraph('Item', style='List Number')
   doc.add_paragraph('Item', style='List Number')
   doc.add_paragraph('Item', style='List Number')

   # To restart: add non-list paragraph between
   doc.add_paragraph('Item', style='List Number')  # 1
   doc.add_paragraph()  # Break
   doc.add_paragraph('Item', style='List Number')  # 1 (restarts)
   ```

3. **Image sizing**: Specify width OR height, not both (unless intentionally distorting)
   ```python
   # CORRECT - maintains aspect ratio
   doc.add_picture('image.png', width=Inches(3.0))

   # WRONG - distorts image
   doc.add_picture('image.png', width=Inches(3.0), height=Inches(2.0))
   ```

4. **Table cell access**: Tables must be created before accessing cells
   ```python
   # WRONG - will error
   table = doc.add_table(rows=0, cols=3)
   table.rows[0].cells[0].text = 'Text'

   # CORRECT - ensure rows exist
   table = doc.add_table(rows=1, cols=3)
   table.rows[0].cells[0].text = 'Text'
   ```

5. **Header/footer per section**: Each section has its own header/footer
   ```python
   # Wrong - modifies only first section
   doc.sections[0].header.paragraphs[0].text = 'Header'

   # Correct - apply to all sections
   for section in doc.sections:
       section.header.paragraphs[0].text = 'Header'
   ```

## Professional Document Patterns

### Report Template
```python
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

doc = Document()

# Cover page
title = doc.add_heading('Annual Report 2024', level=0)
title.alignment = WD_ALIGN_PARAGRAPH.CENTER

doc.add_page_break()

# Table of contents (manual)
doc.add_heading('Table of Contents', level=1)
doc.add_paragraph('1. Executive Summary')
doc.add_paragraph('2. Financial Overview')
doc.add_paragraph('3. Conclusion')

doc.add_page_break()

# Content sections
doc.add_heading('Executive Summary', level=1)
doc.add_paragraph('Lorem ipsum dolor sit amet...')

doc.save('report.docx')
```

### Letter Template
```python
doc = Document()

# Header
section = doc.sections[0]
section.top_margin = Inches(1)

# Sender info
p = doc.add_paragraph()
p.add_run('Company Name\n').bold = True
p.add_run('123 Main Street\nCity, State 12345')

doc.add_paragraph()  # Spacing

# Date
doc.add_paragraph('December 9, 2024')

doc.add_paragraph()

# Recipient
doc.add_paragraph('Dear Sir/Madam,')

# Body
doc.add_paragraph('Letter content here...')

# Closing
doc.add_paragraph()
doc.add_paragraph('Sincerely,')
doc.add_paragraph()
doc.add_paragraph('Your Name')

doc.save('letter.docx')
```

## Enums Reference

Common enumerations:

```python
# Alignment
from docx.enum.text import WD_ALIGN_PARAGRAPH
WD_ALIGN_PARAGRAPH.LEFT
WD_ALIGN_PARAGRAPH.CENTER
WD_ALIGN_PARAGRAPH.RIGHT
WD_ALIGN_PARAGRAPH.JUSTIFY

# Color highlighting
from docx.enum.text import WD_COLOR_INDEX
WD_COLOR_INDEX.YELLOW
WD_COLOR_INDEX.GREEN
WD_COLOR_INDEX.TURQUOISE
WD_COLOR_INDEX.PINK
WD_COLOR_INDEX.BLUE
WD_COLOR_INDEX.RED

# Underline types
from docx.enum.text import WD_UNDERLINE
WD_UNDERLINE.SINGLE
WD_UNDERLINE.DOUBLE
WD_UNDERLINE.WAVY
WD_UNDERLINE.DOTTED
WD_UNDERLINE.DASH

# Table styles (built-in)
'Table Grid'
'Light Shading'
'Light Shading Accent 1'
'Light Grid Accent 1'
'Medium Shading 1'
'Medium Shading 1 Accent 1'
```

## Key Differences from docx-js

1. **No async**: python-docx is synchronous - no `await` needed
2. **Different API**: Uses methods like `add_heading()`, `add_paragraph()` instead of object construction
3. **Simpler styling**: Uses style names (strings) instead of complex style objects
4. **Built-in list styles**: Just use 'List Bullet' or 'List Number' styles
5. **XML access**: Advanced features require direct XML manipulation via `._element`
