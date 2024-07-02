# La Senda Antigua Web Portal

In this repository we have code for the church's website.

## Developers

### Current developers for 2024

- Hugo Quiñónez
- David Chacon
- Samuel Chacon
- Jeremiah Eguizabal
- Josue Bautista
- Elias Quiñónez

## To Create A New Page

Each page should be created under its own folder. The name of each page should be index.html and the specific css file for that page should be in the same directory.

For example: to create an about page, first create an "about" folder in the root directory, then create an index.html file under the created folder, and a css file called about.css.

Each html page should include all styles, meta tags and scripts that are common for each page in the head section of the document. (See the main index.html page as a reference).

## Page sections

Mark each section of your page with the class `section`. This class enables the classes `content` and `gap` to work in your document.

Headers and footers should be marked as sections.

Paragraphs should be within a section.

## Section content

Section content is a div with the class `content` within a `section` class.

The section content will be centered within the section. For example, the header (a section) will take 100% of the viewport, but the content will be centered. This is especially designed for large screens, where we have more width than enough to work with.

## Page header

To add a header to your page, use the html tage `<header>` with the class `section`, like this:

```html
<header class="section">...</header>
```

### Navigation

Each page should include two `nav` elements (copy from the main index.html page) within the page's header's content:

- `<nav id="menu-closed"> ... </nav>` used for small screens when the navigation menu should be collapsed.
- `<nav id="menu-opened"> ... </nav>` used for large screens and, also, for small screens when the naigation menu is open.

> NOTICE: the naigation elements should be included within the header content, otherwise, they will take the full width of the header.

> [!IMPORTANT]
> Please update the navigation links in each existing page, everytime you create a new page.

## Section gaps

Include `<div class="section gap"></div>` between sections to create a gap between them.

## Page footer

To add a footer to your document, use the html tag `<footer>` with the class `section`.

The content of the footer should be within a div marked with the class `content`.

## Cards

We have common "cards" that can be reused across all pages. These cards are html/css elements that we use for style consistency when we want to present paragraph sections.

- Simple card: a simple card consists of a title and a text. Both will be redered with texts aligned to the center.
  ```html
  <div class="card simple-card">
    <div class="title">...</div>
    <div class="text">...</div>
  </div>
  ```
- Image Cards: There are two types of image cards:

  - left
  - right

  The left image card creates a card with an image (it actually can be any type of element, not just an image) aligned to the left, a title and a text. In small screens, this card will stack its content, with the image first, the title second, and the text at the end.

  The right image card aligns the image to the right in large screens, and to the bottom of the stack in small screens.

  ```html
  <!-- left image card -->
  <div class="card image-card left">
    <div class="title">...</div>
    <div class="text">...</div>
    <div class="image">...</div>
  </div>

  <!-- right image card -->
  <div class="card image-card right">
    <div class="title">...</div>
    <div class="text">...</div>
    <div class="image">...</div>
  </div>
  ```

## Useful classes

- `accent`: this class adds the `--accent-color` set in the colors.css as the background to the element along with the `--accent-text-color` as the text color.

- `base-color-bg` adds the `--base-color` as the background property.

- `accent-color-text` adds the `--accent-text-color` as the color property.

- `separator`: add to a `span` or `div` to work as a separator within a `flex` container. This will take all available space and push the elements that are after it, to the end of the container.

- `centered-content`: sets the margin properties to `auto`. It only works with elements that have a width other than `auto`.
