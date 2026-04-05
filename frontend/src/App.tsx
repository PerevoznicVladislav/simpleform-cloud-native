import { FormEvent, useState } from "react";
import { SubmissionResponse } from "./types";

const apiBaseUrl =
  window.__APP_CONFIG__?.API_BASE_URL ?? import.meta.env.VITE_API_BASE_URL ?? "/api";

export default function App() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage("Completeaza atat numele, cat si prenumele.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim()
        })
      });

      if (!response.ok) {
        throw new Error("Nu am putut salva datele.");
      }

      const data = (await response.json()) as SubmissionResponse;
      setPopupMessage(data.message);
      setFirstName("");
      setLastName("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "A aparut o eroare neasteptata.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-shell">
      <main className="card">
        <div className="eyebrow">Simple Fullstack Demo</div>
        <h1>Formular cu salvare in MongoDB</h1>
        <p className="description">
          Introdu numele si prenumele, apoi trimite formularul. Backend-ul salveaza datele, iar
          frontend-ul afiseaza un popup cu mesajul primit.
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <label>
            Nume
            <input
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="Ex: Popescu"
            />
          </label>

          <label>
            Prenume
            <input
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              placeholder="Ex: Ana"
            />
          </label>

          {errorMessage ? <div className="error-box">{errorMessage}</div> : null}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Se trimite..." : "Submit"}
          </button>
        </form>
      </main>

      {popupMessage ? (
        <div className="modal-overlay" role="presentation" onClick={() => setPopupMessage("")}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="popup-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="popup-title">Succes</h2>
            <p>{popupMessage}</p>
            <button type="button" onClick={() => setPopupMessage("")}>
              Inchide
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
