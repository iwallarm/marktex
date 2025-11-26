
you are product designer and engineer to build markdown editor for scientists for run latex style formukla ricj texts to PDF with title and columns like tyical arxiv using copy/paste from ChatGPT markdown. 

This should be super easy, visually editable and markdown mode enabling for formulas, etc editing.
It should be possible to add page breaks to make PDF pretty

make JS only client-side with no backend at all (export to PDF is possbile this way)

Sample text:

## Chapter: The Fractal Cell

This chapter describes the **Fractal Cell** that underpins the F-SVD and Spectral variants of the Fractal Network. Conceptually, a Fractal Cell is a **miniature MLP shard** cut out of a large dense layer and tuned to a narrow spectral band of the data.

---

### 1. From Dense Layer to Fractal Shards

A standard transformer MLP layer is parameterized by a dense weight matrix
[
W \in \mathbb{R}^{d_{\text{in}} \times d_{\text{out}}}
]
with (O(d_{\text{in}} \cdot d_{\text{out}})) parameters. It behaves as a **monolithic generalist**: every input dimension can talk directly to every output dimension.

In the Fractal Network, this monolith is decomposed into a **sum of specialized shards**:
[
W \approx \sum_{k=0}^{K-1} W_k, \qquad W_k = U_k V_k^\top
]
Each (W_k) is implemented as a **Fractal Cell**. Cells are:

* **Self-similar** to the parent MLP (same input/output dimensions)
* **Low-rank** (rank (r_k \ll d_{\text{in}}, d_{\text{out}}))
* **Spectrally specialized** to a narrow band of the singular value spectrum

The F-SVD approach derives these shards via SVD-style factorization of the dense layer; the Spectral approach then trains and reweights them via learnable spectral gains.

---

### 2. Anatomy of a Fractal Cell

Consider a single cell (k). It operates on the same context vector (x \in \mathbb{R}^{d_{\text{in}}}) as the parent layer, but processes only a **low-rank slice** of it.

#### 2.1 Input Interface

* **Input**:
  [
  x \in \mathbb{R}^{d_{\text{in}}} \quad (\text{e.g., } d_{\text{in}} = 4096)
  ]
* **Property**: Every Fractal Cell in a branch sees **the same** input vector (x).
* **Intuition**: Multiple specialists look at the same scene while each searches for different patterns.

Formally, all cells share the same input stream; only their internal projections and gains differ.

#### 2.2 Low-Rank Memory: Compressor and Expander

The core of the cell is a **low-rank factorization**:

* Compressor (V_k \in \mathbb{R}^{d_{\text{in}} \times r_k})
* Expander (U_k \in \mathbb{R}^{r_k \times d_{\text{out}}})

The forward path:

[
\begin{aligned}
h_k &= V_k^\top x \in \mathbb{R}^{r_k} \quad &&\text{(compression)} \
a_k &= \phi(h_k) \quad &&\text{(nonlinearity)} \
\tilde{y}*k &= U_k a_k \in \mathbb{R}^{d*{\text{out}}} \quad &&\text{(expansion)}
\end{aligned}
]

where (\phi) is SiLU and (r_k) is the cell’s rank (e.g., 32).

**Interpretation**

* (V_k): selects a small set of directions in input space – what this cell “cares about”.
* (U_k): maps those internal concepts back into the full output space.

Instead of storing direct pairwise connections (“token i → neuron j”), the Fractal Cell stores **patterns** (“projection onto concept (r) → pattern in outputs”).

**Parameter count**

* Dense layer: (d_{\text{in}} \cdot d_{\text{out}})
* Fractal Cell: (d_{\text{in}} \cdot r_k + r_k \cdot d_{\text{out}} = r_k(d_{\text{in}} + d_{\text{out}}))

For (r_k \ll \min(d_{\text{in}}, d_{\text{out}})), this is a dramatic reduction.

#### 2.3 Activation Core: SiLU on Compressed Space

The nonlinearity is applied in the **compressed** space:

[
a_k = \phi(h_k) = \phi(V_k^\top x)
]

with (\phi) chosen as SiLU.

* The cell performs **nonlinear reasoning** in a small latent space of dimension (r_k).
* Because (r_k) is small, the cell can make **fast, simple decisions** about a specific feature band.
* The combination of low rank + nonlinearity lets the cell model structured patterns (e.g., grammatical templates, stylistic biases) without paying the cost of full-rank computation.

#### 2.4 Spectral Volume Knob: (\alpha_k)

Each cell output is scaled by a learnable scalar:

[
y_k = \alpha_k , \tilde{y}_k = \alpha_k , U_k \phi(V_k^\top x)
]

with (\alpha_k \in \mathbb{R}) implemented as a parameter:

```python
self.alpha = nn.Parameter(...)
```

Role of (\alpha_k):

* Acts as a **spectral gain** on cell (k).
* Allows the model to **amplify** or **mute** entire spectral bands during training.
* Enables **soft pruning**: if a cell consistently hurts the loss (e.g., adds noise), gradients push (\alpha_k \to 0), effectively disabling it without deleting its weights.

The complete layer output is the **superposition**:

[
y = \sum_{k=0}^{K-1} y_k = \sum_{k=0}^{K-1} \alpha_k , U_k \phi(V_k^\top x)
]

This is both a spectral mixture and a fractal sum of self-similar MLP shards.

---

### 3. Memory as Holographic Fragments

A standard neuron layer stores a static grid of weights:

* **Standard neuron / layer**

  * Storage: (W \in \mathbb{R}^{d_{\text{in}} \times d_{\text{out}}})
  * Concept: “I connect input (i) directly to output (j)”
  * Role: generalist, full-spectrum

A Fractal Cell stores **two thin matrices**:

* Storage: (U_k \in \mathbb{R}^{r_k \times d_{\text{out}}}), (V_k \in \mathbb{R}^{d_{\text{in}} \times r_k})
* Concept: “I connect input to a **hidden concept** of dimension (r_k), then connect that concept to outputs”
* Role: **specialist**, **band-limited**

You can think of each cell as holding a **hologram fragment**:

* Any single fragment is incomplete; it only captures a specific pattern family.
* Combining multiple fragments reconstructs a richer picture.
* The spectrum of ranks ({r_k}) shapes how coarse or fine each fragment is.

---

### 4. Fractal Hierarchy of Cells

The “fractal” property emerges from how cells are arranged **across ranks**. They are not just parallel peers; they form a **hierarchical refinement** of the same mapping.

We can write the effective intelligence of a layer as:

[
\text{Intelligence}(x) = \sum_{k=0}^{K-1} y_k(x)
]

with each (y_k(x)) refining the previous ones. A typical configuration:

* **Cell 0 – Anchor Cell**

  * Rank: high (e.g., (r_0 = 128))
  * Job: capture **structural** patterns (syntax, coarse sequencing).
  * Example: “The man went to the …” → It decides the next token should be a location-type noun.

* **Cell 1 – Detail Cell**

  * Rank: medium (e.g., (r_1 = 64))
  * Job: capture **semantic refinements**.
  * Example: chooses “store” vs “office” vs “park” given context.

* **Cell 2 – Texture Cell**

  * Rank: low (e.g., (r_2 = 32))
  * Job: capture **nuance-level** differences.
  * Example: “grocery store” vs “hardware store”, subtle topic shifts.

* **Cell 3 – Noise / Format Cell**

  * Rank: very low (e.g., (r_3 = 8))
  * Job: capture **formatting and surface features**.
  * Example: capitalization, punctuation, spacing, stylistic quirks.

The F-SVD method connects this hierarchy directly to the singular value spectrum of the original dense matrix:

* Higher-rank cells approximate the **largest singular values** (coarse structure).
* Lower-rank cells approximate **smaller singular values** (fine details, noise, format).
* The Spectral approach then learns the (\alpha_k) gains, effectively performing **learned spectral filtering** over these bands.

---

### 5. Relation to LoRA and Spectral Filtering

A Fractal Cell is structurally similar to a **Low-Rank Adapter** (LoRA):

* LoRA: add a low-rank (U V^\top) on top of a frozen base weight (W_0).
* Fractal Network: instead of a single dense (W_0) plus a few adapters, the **entire layer** is built as a **sum of low-rank adapters**:
  [
  W \approx \sum_k \alpha_k U_k V_k^\top
  ]

Key differences:

* The Fractal Cells are **first-class citizens**, not small corrections.
* All parameters (including (U_k, V_k, \alpha_k)) are trained jointly from scratch or from F-SVD initialization.
* Spectral gains (\alpha_k) allow dynamic **re-weighting of frequency bands** during training and fine-tuning.

This turns the layer into a **trainable spectral filter bank**:

* Cells aligned with useful patterns see (|\alpha_k|) grow.
* Cells aligned with noise see (\alpha_k) shrink toward zero.
* The network self-organizes into a sparse, spectrally structured collection of specialists.

---

### 6. Practical View: What a Fractal Cell Buys You

Core benefits:

1. **Memory efficiency**
   Replace a full (N^2) matrix with (2 N r_k) parameters per cell, while still capturing rich nonlinear interactions via SiLU.

2. **Spectral interpretability**
   Ranks and (\alpha_k) form a direct handle on **which parts of the spectrum** the model trusts.

3. **Soft pruning and robustness**
   Cells that hurt perplexity are suppressed via (\alpha_k) rather than hard-deleted, keeping capacity on standby.

4. **Fractal scalability**
   Need more capacity? Add cells at different ranks or spectral bands without redesigning the base architecture.

In short, a Fractal Cell is a low-rank spectral specialist that replaces a chunk of a dense layer. The full Fractal Network is a superposition of these specialists, coordinated by spectral gains into a coherent, high-capacity model.

