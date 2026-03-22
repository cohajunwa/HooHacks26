import { useRef, useState, type FormEvent } from 'react';
import type { Product, StyleAssistantResponse } from '../types';
import OutfitSection from './OutfitSection';
import ProductModal from './ProductModal';
import styles from './StyleAssistant.module.css';

type Step = 'upload' | 'search';

export default function StyleAssistant() {
  const [step, setStep] = useState<Step>('upload');
  const [images, setImages] = useState<{ file: File; url: string }[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search step state
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<StyleAssistantResponse | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const incoming = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .map(file => ({ file, url: URL.createObjectURL(file) }));
    setImages(prev => [...prev, ...incoming]);
  }

  function removeImage(index: number) {
    setImages(prev => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const form = new FormData();
      form.append('query', q);
      for (const img of images) form.append('images', img.file);

      const base = import.meta.env.VITE_API_URL ?? '';
      const res = await fetch(`${base}/style-assistant`, { method: 'POST', body: form });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setResponse(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  // ── Upload step ──
  if (step === 'upload') {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <h2 className={styles.heading}>Upload your inspiration!</h2>
          <p className={styles.subheading}>
            Add photos that capture the style you're going for and we'll use them to recommend outfits.
          </p>

          <div
            className={`${styles.dropzone} ${dragging ? styles.dropzoneDragging : ''}`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className={styles.hiddenInput}
              onChange={e => addFiles(e.target.files)}
            />

            {images.length === 0 ? (
              <div className={styles.dropzoneEmpty} onClick={() => inputRef.current?.click()}>
                <span className={styles.dropzoneIcon}>↑</span>
                <p>Drag & drop photos here, or click to browse</p>
              </div>
            ) : (
              <div className={styles.mosaic}>
                {images.map((img, i) => (
                  <div key={img.url} className={styles.mosaicItem}>
                    <img src={img.url} alt={`Inspiration ${i + 1}`} className={styles.mosaicImg} />
                    <button
                      className={styles.removeBtn}
                      onClick={e => { e.stopPropagation(); removeImage(i); }}
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <button className={styles.uploadBtn} onClick={() => inputRef.current?.click()}>
              Upload Photos
            </button>
            <button
              className={styles.nextBtn}
              disabled={images.length === 0}
              onClick={() => setStep('search')}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Search step ──
  return (
    <div className={styles.page}>
      <div className={styles.searchContainer}>
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Ask for fashion advice! (e.g., Give me ideas for an interview?)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <button className={styles.searchBtn} type="submit" disabled={loading || !query.trim()}>
            {loading ? '…' : 'Get Recommendations'}
          </button>
        </form>

        <button className={styles.backBtn} onClick={() => { setStep('upload'); setResponse(null); }}>
          ← Back
        </button>

        {error && <p className={styles.error}>{error}</p>}

        {loading && (
          <div className={styles.loadingState}>
            <p>Analyzing your style and finding sustainable options…</p>
          </div>
        )}

        {response && (
          <div className={styles.results}>
            <p className={styles.summary}>{response.summary}</p>
            <div className={styles.outfitSections}>
              {response.outfit_items.map((item, i) => (
                <OutfitSection key={i} item={item} onSelect={setSelectedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}
