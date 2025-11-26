# MarkTeX

A browser-based Markdown editor for scientists. Paste ChatGPT responses with LaTeX formulas and export to ArXiv-style PDF.

## Features

- **LaTeX Math Rendering** - Full MathJax support for inline `$x^2$` and display `$$\sum_{i=1}^n$$` math
- **ArXiv-Style PDF Export** - Two-column academic paper layout with proper typography
- **Visual + Source Modes** - Edit visually or work directly with Markdown
- **ChatGPT Compatible** - Paste directly from ChatGPT, formulas render automatically
- **Version History** - Auto-saves with diff-based history, preview any version
- **No Backend Required** - Runs entirely in the browser

## Quick Start

```bash
node server.js
# Open http://localhost:33133
```

Or just open `index.html` directly in a browser.

## Usage

### Metadata Tags

Add paper metadata at the top of your document:

```markdown
@title: Your Paper Title
@authors: Author One, Author Two
@date: 2025
@abstract: Your abstract text here. Describe the main contributions and findings.

## Introduction

Your content starts here...
```

### Math Formulas

Inline math with single dollars:
```markdown
The equation $E = mc^2$ changed physics.
```

Display math with double dollars:
```markdown
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

### Page Breaks

Insert manual page breaks:
```markdown
===pagebreak===
```

## Example Document

```markdown
@title: Introduction to Neural Networks
@authors: Jane Smith, John Doe
@date: 2025
@abstract: This paper provides an overview of neural network architectures and their mathematical foundations.

## Introduction

Neural networks are computational models inspired by biological neurons. A single neuron computes:

$$
y = \sigma\left(\sum_{i=1}^{n} w_i x_i + b\right)
$$

where $\sigma$ is an activation function, $w_i$ are weights, and $b$ is the bias term.

## Architecture

### Feedforward Networks

The output of layer $l$ is given by:

$$
\mathbf{h}^{(l)} = \sigma\left(\mathbf{W}^{(l)} \mathbf{h}^{(l-1)} + \mathbf{b}^{(l)}\right)
$$

### Loss Function

We minimize the cross-entropy loss:

$$
\mathcal{L} = -\sum_{i=1}^{N} y_i \log(\hat{y}_i)
$$

## Conclusion

Neural networks provide powerful function approximation capabilities through hierarchical feature learning.
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save as .md file |
| `Ctrl+P` | Export to PDF |
| `Ctrl+B` | Bold text |
| `Ctrl+I` | Italic text |

## License

MIT
