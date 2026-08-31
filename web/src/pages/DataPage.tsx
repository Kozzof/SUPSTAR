import {
  type ChangeEvent,
  type FormEvent,
  useState,
} from 'react';

import {
  API_URL,
  apiRequest,
  getToken,
} from '../api/api';

interface ImportResult {
  imported: number;
  failed: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}

export default function DataPage() {
  const [file, setFile] =
    useState<File | null>(null);

  const [result, setResult] =
    useState<ImportResult | null>(
      null,
    );

  const [error, setError] =
    useState('');

  const [importing, setImporting] =
    useState(false);

  function handleFile(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setFile(
      event.target.files?.[0] ??
        null,
    );

    setResult(null);
    setError('');
  }

  async function exportPlaces(
    format: 'json' | 'csv',
  ) {
    setError('');

    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/data/export/places?format=${format}`,
        {
          headers: token
            ? {
                Authorization:
                  `Bearer ${token}`,
              }
            : undefined,
        },
      );

      if (!response.ok) {
        throw new Error(
          `Erreur ${response.status}`,
        );
      }

      const blob =
        await response.blob();

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement('a');

      link.href = url;

      link.download =
        `supstar-places.${format}`;

      document.body.appendChild(
        link,
      );

      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Export impossible.',
      );
    }
  }

  async function importPlaces(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (!file) {
      setError(
        'Sélectionnez un fichier.',
      );
      return;
    }

    const extension =
      file.name
        .split('.')
        .pop()
        ?.toLowerCase();

    if (
      extension !== 'json' &&
      extension !== 'csv'
    ) {
      setError(
        'Le fichier doit être au format JSON ou CSV.',
      );
      return;
    }

    setImporting(true);
    setError('');
    setResult(null);

    try {
      const data =
        await file.text();

      const response =
        await apiRequest<ImportResult>(
          '/data/import/places',
          {
            method: 'POST',
            body: {
              format: extension,
              data,
            },
          },
        );

      setResult(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Import impossible.',
      );
    } finally {
      setImporting(false);
    }
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Import / Export</h1>

          <p>
            Échangez les données des
            lieux au format JSON ou CSV.
          </p>
        </div>
      </div>

      {error && (
        <p className="error">
          {error}
        </p>
      )}

      <div className="data-grid">
        <section className="panel">
          <h2>Exporter les lieux</h2>

          <p>
            Téléchargez les données
            actuellement enregistrées
            dans SUPSTAR.
          </p>

          <div className="export-buttons">
            <button
              type="button"
              onClick={() =>
                void exportPlaces(
                  'json',
                )
              }
            >
              Exporter en JSON
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                void exportPlaces(
                  'csv',
                )
              }
            >
              Exporter en CSV
            </button>
          </div>
        </section>

        <section className="panel">
          <h2>Importer des lieux</h2>

          <form
            className="form"
            onSubmit={importPlaces}
          >
            <label>
              Fichier JSON ou CSV
              <input
                type="file"
                accept=".json,.csv,application/json,text/csv"
                onChange={
                  handleFile
                }
              />
            </label>

            {file && (
              <p>
                Fichier sélectionné :{' '}
                <strong>
                  {file.name}
                </strong>
              </p>
            )}

            <button
              type="submit"
              disabled={
                importing || !file
              }
            >
              {importing
                ? 'Import...'
                : 'Importer'}
            </button>
          </form>
        </section>
      </div>

      {result && (
        <section className="panel">
          <h2>
            Résultat de l’import
          </h2>

          <div className="import-summary">
            <div>
              <strong>
                {result.imported}
              </strong>

              <span>
                importé
                {result.imported > 1
                  ? 's'
                  : ''}
              </span>
            </div>

            <div>
              <strong>
                {result.failed}
              </strong>

              <span>
                échec
                {result.failed > 1
                  ? 's'
                  : ''}
              </span>
            </div>
          </div>

          {result.errors.length >
            0 && (
            <>
              <h3>Erreurs</h3>

              <div className="import-errors">
                {result.errors.map(
                  (
                    importError,
                    index,
                  ) => (
                    <p key={index}>
                      Ligne{' '}
                      {importError.row}
                      {' : '}
                      {
                        importError.message
                      }
                    </p>
                  ),
                )}
              </div>
            </>
          )}
        </section>
      )}
    </main>
  );
}