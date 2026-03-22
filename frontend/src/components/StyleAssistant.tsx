import { useRef, useState } from 'react';
import styles from './StyleAssistant.module.css';

type Step = 'upload' | 'search';

export default function StyleAssistant() {
  const [step, setStep] = useState<Step>('upload');
  const [images, setImages] = useState<{ file: File; url: string }[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  if (step === 'search') {
    return <div>Search step coming soon</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h2 className={styles.heading}>Upload your inspiration!</h2>
        <p className={styles.subheading}>
          Add photos that capture the style you're going for and we'll use them to recommend outfits.
        </p>

        {/* Drop zone */}
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

